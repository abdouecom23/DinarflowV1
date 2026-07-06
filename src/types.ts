export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  AGENT = 'AGENT',
}

/**
 * Algerian PSP Account Tiers and Limits (in Dinar - DA)
 */
export enum AccountTier {
  LEVEL_1 = 1, // 100,000 DA
  LEVEL_2 = 2, // 500,000 DA
  LEVEL_3 = 3, // 1,000,000 DA
}

export const TIER_LIMITS = {
  [AccountTier.LEVEL_1]: 100000,
  [AccountTier.LEVEL_2]: 500000,
  [AccountTier.LEVEL_3]: 1000000,
};

export const DAILY_OUTFLOW_LIMITS = {
  [AccountTier.LEVEL_1]: 20000,
  [AccountTier.LEVEL_2]: 100000,
  [AccountTier.LEVEL_3]: 500000,
};

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  PENDING_KYC = 'PENDING_KYC',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED',
}

export enum KYCStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING_REVIEW = 'PENDING_REVIEW',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
}
