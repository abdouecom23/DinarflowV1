import { Controller, Post, Body, Req, UseGuards, UnauthorizedException, NotFoundException, Inject } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '../../../types';

@Controller('api/v1/users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  @Post('promote')
  async promoteUser(
    @Req() req: any,
    @Body() body: { userId: string; role: string },
  ) {
    // Validate that caller is an ADMIN
    if (req.user.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Access denied. Administrator privileges required.');
    }

    // Validate the target role exists in UserRole enum
    const desiredRole = body.role as UserRole;
    if (!Object.values(UserRole).includes(desiredRole)) {
      throw new UnauthorizedException(`Invalid target role. Allowed roles: ${Object.keys(UserRole).join(', ')}`);
    }

    // Fetch target user
    const targetUser = await this.usersService.findOne(body.userId);
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    // Update role
    targetUser.role = desiredRole;
    const updatedUser = await this.usersService.save(targetUser);

    return {
      success: true,
      message: `User ${updatedUser.email} has been successfully assigned role ${updatedUser.role}.`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    };
  }
}
