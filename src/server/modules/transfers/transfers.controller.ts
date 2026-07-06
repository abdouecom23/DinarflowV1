import { Controller, Post, Body, Req, UseGuards, Headers, Inject } from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TransferDto } from './dto/transfer.dto';

@Controller('api/v1/transfers')
@UseGuards(JwtAuthGuard)
export class TransfersController {
  constructor(@Inject(TransfersService) private transfersService: TransfersService) {}

  @Post('p2p')
  async p2pTransfer(
    @Body() transferDto: TransferDto,
    @Req() req: any,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    return this.transfersService.transfer({
      senderAccountId: req.user.accountId, // Assume this is populated by a strategy
      receiverAccountId: transferDto.receiverAccountId,
      amountCentimes: transferDto.amountCentimes,
      type: 'P2P',
      reference: transferDto.reference,
      idempotencyKey,
    });
  }
}
