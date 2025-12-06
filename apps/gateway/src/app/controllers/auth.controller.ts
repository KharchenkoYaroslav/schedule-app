import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Req,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { ThrottlerGuard} from '@nestjs/throttler';
import type { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginInput } from '../dto/auth/input/login.input';
import { RegisterInput } from '../dto/auth/input/register.input';
import { ChangeLoginInput } from '../dto/auth/input/change-login.input';
import { ChangePasswordInput } from '../dto/auth/input/change-password.input';
import { AddAllowedUserInput } from '../dto/auth/input/add-allowed-user.input';
import { DeleteAllowedUserInput } from '../dto/auth/input/delete-allowed-user.input';
import { ChangeUserRoleInput } from '../dto/auth/input/change-user-role.input';
import { RestAuthGuard, Roles } from '../guards/auth.guard';
import { UserRole } from '../dto/auth/types/user-role.enum';

interface AuthRequest extends Request {
  user: {
    sub: string;
    role: UserRole;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('verify')
  async verify(@Query() data: { token: string }) {
    return this.authService.verify(data);
  }

  @UseGuards(ThrottlerGuard)
  @Post('login')
  async login(@Body() data: LoginInput) {
    return this.authService.login(data);
  }

  @UseGuards(ThrottlerGuard)
  @Post('register')
  async register(@Body() data: RegisterInput) {
    return this.authService.register(data);
  }

  @Patch('change-login')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeLogin(@Body() data: ChangeLoginInput, @Req() req: AuthRequest) {
    const userId = req.user.sub;
    await this.authService.changeLogin({ ...data, userId });
    return;
  }

  @Patch('change-password')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Body() data: ChangePasswordInput,
    @Req() req: AuthRequest
  ) {
    const userId = req.user.sub;
    await this.authService.changePassword({ ...data, userId });
    return;
  }

  @Delete('delete-account')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@Req() req: AuthRequest) {
    const userId = req.user.sub;
    await this.authService.deleteAccount({ userId });
    return;
  }

  @Get('users')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async getUsers() {
    return this.authService.getUsers();
  }

  @Get('allowed-users')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async getAllowedUsers() {
    return this.authService.getAllowedUsers();
  }

  @Post('add-allowed-user')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async addAllowedUser(@Body() data: AddAllowedUserInput) {
    await this.authService.addAllowedUser(data);
    return;
  }

  @Delete('allowed-user/:userId')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllowedUser(@Param() data: DeleteAllowedUserInput) {
    await this.authService.deleteAllowedUser(data);
    return;
  }

  @Patch('change-user-role')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeUserRole(@Body() data: ChangeUserRoleInput) {
    await this.authService.changeUserRole(data);
    return;
  }

  @Delete('user/:userId')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('userId') userId: string) {
    await this.authService.deleteAccount({ userId });
    return;
  }
}
