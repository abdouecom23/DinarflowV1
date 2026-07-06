import { IsUUID, IsInt, IsPositive, IsOptional, IsString } from 'class-validator';

export class TransferDto {
  @IsUUID()
  receiverAccountId: string;

  @IsInt()
  @IsPositive()
  amountCentimes: number;

  @IsOptional()
  @IsString()
  reference?: string;
}
