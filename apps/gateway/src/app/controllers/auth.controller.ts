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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
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
import { LoginResponse } from '../dto/auth/response/login.response';
import { VerifyResponse } from '../dto/auth/response/verify.response';
import { UsersResponseDto } from '../dto/auth/response/users.response';
import { RefreshInput } from '../dto/auth/input/refresh.input';

interface AuthRequest extends Request {
  user: {
    sub: string;
    role: UserRole;
  };
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Verify user token' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: VerifyResponse,
    description: 'Returns the validity of the token and user role',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired token',
  })
  @Get('verify')
  async verify(@Query() data: { token: string }) {
    return this.authService.verify(data);
  }

  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: LoginResponse,
    description: 'Successfully logged in',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  @UseGuards(ThrottlerGuard)
  @Post('login')
  async login(@Body() data: LoginInput) {
    return this.authService.login(data);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: LoginResponse,
    description: 'Tokens refreshed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or expired refresh token',
  })
  @Post('refresh')
  async refresh(@Body() data: RefreshInput) {
    return this.authService.refresh(data);
  }

  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: LoginResponse,
    description: 'Successfully registered',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Registration not allowed for this login',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already exists',
  })
  @UseGuards(ThrottlerGuard)
  @Post('register')
  async register(@Body() data: RegisterInput) {
    return this.authService.register(data);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user login' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Login changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Login already taken',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @Patch('change-login')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeLogin(@Body() data: ChangeLoginInput, @Req() req: AuthRequest) {
    const userId = req.user.sub;
    await this.authService.changeLogin({ ...data, userId });
    return;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Password changed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid current password or Unauthorized',
  })
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

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete own account' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Account deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @Delete('delete-account')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@Req() req: AuthRequest) {
    const userId = req.user.sub;
    await this.authService.deleteAccount({ userId });
    return;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UsersResponseDto,
    description: 'List of all users',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource',
  })
  @Get('users')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async getUsers() {
    return this.authService.getUsers();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get allowed users list' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UsersResponseDto,
    description: 'List of allowed users for registration',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource',
  })
  @Get('allowed-users')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async getAllowedUsers() {
    return this.authService.getAllowedUsers();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a user to the allowed list' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User added to allowed list',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'User already in the allowed list',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource',
  })
  @Post('add-allowed-user')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async addAllowedUser(@Body() data: AddAllowedUserInput) {
    await this.authService.addAllowedUser(data);
    return;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a user from the allowed list' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User removed from allowed list',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource',
  })
  @Delete('allowed-user/:userId')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAllowedUser(@Param() data: DeleteAllowedUserInput) {
    await this.authService.deleteAllowedUser(data);
    return;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user role' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User role updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource',
  })
  @Patch('change-user-role')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeUserRole(@Body() data: ChangeUserRoleInput) {
    await this.authService.changeUserRole(data);
    return;
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource',
  })
  @Delete('user/:userId')
  @UseGuards(RestAuthGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('userId') userId: string) {
    await this.authService.deleteAccount({ userId });
    return;
  }
}
