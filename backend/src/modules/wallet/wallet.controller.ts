import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Request() req) {
    return this.walletService.getBalance(req.user.userId);
  }

  @Post('payout')
  async requestPayout(@Request() req, @Body() createPayoutDto: CreatePayoutDto) {
    return this.walletService.requestPayout(req.user.userId, createPayoutDto.amount);
  }

  @Get('payouts')
  async getPayoutHistory(@Request() req) {
    return this.walletService.getPayoutHistory(req.user.userId);
  }
}
