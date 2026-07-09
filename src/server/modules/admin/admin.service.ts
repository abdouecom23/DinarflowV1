import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from '../../entities/user.entity';
import { Account } from '../../entities/account.entity';
import { Transaction } from '../../entities/transaction.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { SystemConfig } from '../../entities/system-config.entity';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,

    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,

    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,

    @InjectRepository(SystemConfig)
    private readonly configRepo: Repository<SystemConfig>,
  ) {}

  private getGeminiClient(): GoogleGenAI {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new BadRequestException('GEMINI_API_KEY environment variable is required to generate AI Suspicious Activity Reports.');
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  // 1. Get KYC documents for a user
  async getKYCDocuments(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Return mock documents based on the user's KYC status to verify
    return {
      userId: user.id,
      fullName: user.full_name,
      email: user.email,
      kycLevel: user.kyc_level,
      kycStatus: user.kyc_status,
      submittedAt: user.created_at,
      documents: [
        {
          id: 'doc-national-id-' + user.id.substring(0, 4),
          type: 'National Identity Card',
          status: user.kyc_status,
          fileUrl: 'https://images.unsplash.com/photo-1554774853-719586f82d77?auto=format&fit=crop&w=800&q=80',
          number: 'DZ-' + Math.floor(10000000 + Math.random() * 90000000),
        },
        {
          id: 'doc-utility-bill-' + user.id.substring(0, 4),
          type: 'Proof of Residency (Utility Bill)',
          status: user.kyc_status,
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
          number: 'BILL-' + Math.floor(100000 + Math.random() * 900000),
        }
      ]
    };
  }

  // Helper: Approve/Reject user KYC status
  async updateKYCStatus(userId: string, status: 'VERIFIED' | 'REJECTED') {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.kyc_status = status;
    if (status === 'VERIFIED') {
      user.kyc_level = Math.max(user.kyc_level, 2);
    } else {
      user.kyc_level = 1;
    }
    
    await this.userRepo.save(user);

    // Write audit log
    await this.auditRepo.save({
      level: 'LOG',
      context: 'ComplianceAdmin',
      message: `Admin updated KYC status for ${user.email} (${user.full_name}) to ${status}`,
    });

    return {
      success: true,
      userId: user.id,
      kycStatus: user.kyc_status,
      kycLevel: user.kyc_level,
    };
  }

  // 2. Generate AML Report (SAR) using Gemini AI
  async generateAMLReport(userId: string, notes?: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Retrieve user accounts and their transactions
    const accounts = await this.accountRepo.find({ where: { user: { id: user.id } } });
    const accountIds = accounts.map(a => a.id);

    let transactions: Transaction[] = [];
    if (accountIds.length > 0) {
      transactions = await this.transactionRepo.find({
        where: [
          { senderAccount: { id: accountIds[0] } },
          { receiverAccount: { id: accountIds[0] } }
        ],
        relations: {
          senderAccount: { user: true },
          receiverAccount: { user: true },
        },
        order: { ts: 'DESC' },
        take: 20
      });
    }

    // Build transation history string
    const txHistoryStr = transactions.map(tx => {
      const type = tx.type;
      const amountStr = `${(Number(tx.amount) / 100).toFixed(2)} DA`;
      const sender = tx.senderAccount?.user?.full_name || 'Unknown';
      const receiver = tx.receiverAccount?.user?.full_name || 'Unknown';
      return `- Date: ${tx.ts.toISOString()}, Type: ${type}, Amount: ${amountStr}, Sender: ${sender}, Receiver: ${receiver}, Reference: "${tx.reference}", Status: ${tx.status}`;
    }).join('\n') || 'No recent transactions found.';

    const systemInfo = `
User Information:
- Full Name: ${user.full_name}
- Email: ${user.email}
- KYC Level: Level ${user.kyc_level}
- KYC Status: ${user.kyc_status}
- Account Joined: ${user.created_at.toISOString()}

User Accounts:
${accounts.map(a => `- IBAN: ${a.iban}, Balance: ${(Number(a.balance) / 100).toFixed(2)} DA, Status: ${a.status}`).join('\n') || 'No accounts active.'}

Recent Transaction Volume & History:
${txHistoryStr}

Admin Provided Context/Notes:
"${notes || 'None provided.'}"
`;

    const prompt = `You are a certified Anti-Money Laundering (AML) Compliance Agent for DinarFlow, the leading Algerian PSP.
Please analyze the user's details and transaction logs below, and write an official Suspicious Activity Report (SAR) to submit to the CTR (Cellule de Traitement du Renseignement Financier) and the Central Bank.

Provide a highly professional markdown report with:
1. EXECUTIVE SUMMARY: Main suspicions and severity level.
2. FINANCIAL ANALYSIS: Break down suspicious patterns, velocity changes, transaction size anomalies, or unusual references.
3. RISK PROFILE: Assessment of risk level (Low, Medium, High).
4. COMPLIANCE RECOMMENDATION: Recommended actions (e.g., Freeze Accounts, Limit Tiers, Report to Authorities).

Structure the response with professional banking and AML terminology. Here is the data:
${systemInfo}
`;

    // Initialize Gemini and generate report
    const ai = this.getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "You are an expert AML (Anti-Money Laundering) analyst and compliance officer who produces precise, rigorous Suspicious Activity Reports (SAR).",
        temperature: 0.2,
      }
    });

    const reportContent = response.text || 'Failed to generate AML Report.';

    // Store log of generated report
    await this.auditRepo.save({
      level: 'WARN',
      context: 'AML_Compliance',
      message: `AI Suspicious Activity Report (SAR) generated for ${user.email} (${user.full_name}). Notes: ${notes || 'none'}`,
    });

    return {
      success: true,
      userId: user.id,
      fullName: user.full_name,
      email: user.email,
      generatedReport: reportContent,
      generatedAt: new Date(),
    };
  }

  // 3. System Config Controls
  async getSystemConfig(): Promise<SystemConfig> {
    let config = await this.configRepo.findOne({ order: { updated_at: 'DESC' } });
    if (!config) {
      config = this.configRepo.create({
        maintenanceMode: false,
        sandboxMode: true,
        autoSettlement: true,
        manualReview: false,
      });
      await this.configRepo.save(config);
    }
    return config;
  }

  async updateSystemConfig(update: Partial<SystemConfig>): Promise<SystemConfig> {
    const config = await this.getSystemConfig();
    Object.assign(config, update);
    const savedConfig = await this.configRepo.save(config);

    // Audit control updates
    await this.auditRepo.save({
      level: 'WARN',
      context: 'SystemControls',
      message: `System controls updated: ${JSON.stringify(update)}`,
    });

    return savedConfig;
  }

  // 4. Audit Log Retrieval
  async getAuditLogs(limit = 100, level?: string, context?: string) {
    const where: any = {};
    if (level) {
      where.level = level;
    }
    if (context) {
      where.context = Like(`%${context}%`);
    }

    const logs = await this.auditRepo.find({
      where,
      order: { timestamp: 'DESC' },
      take: Math.min(limit, 500),
    });

    return logs;
  }

  // 5. Get Users for Directory
  async getUsers() {
    return this.userRepo.find({
      order: { created_at: 'DESC' },
    });
  }
}
