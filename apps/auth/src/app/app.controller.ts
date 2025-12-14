import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { AuthService } from './app.service';
import { UserRole } from './entities/user-role.enum';
import { AllowedUser } from './entities/allowed-users.entity';
import { User } from './entities/user.entity';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @GrpcMethod('AuthService', 'Login')
  async login(data: { login: string; password: string }) {
    const user = await this.authService.validateUser(data.login, data.password);
    if (!user) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Invalid credentials',
      });
    }
    const tokens = await this.authService.login(user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: user.id,
      login: user.login,
      role: user.role,
      createdAt: user.created_at.toISOString()
    };
  }

  @GrpcMethod('AuthService', 'Register')
  async register(data: { login: string; password: string }) {
    const user = await this.authService.register(data.login, data.password);
    const tokens = await this.authService.login(user);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: user.id,
      login: user.login,
      role: user.role,
      createdAt: user.created_at.toISOString()
    };
  }

  @GrpcMethod('AuthService', 'Logout')
  async logout(data: { userId: string }) {
    await this.authService.logout(data.userId);
    return { success: true };
  }

  @GrpcMethod('AuthService', 'Refresh')
  async refresh(data: { refreshToken: string }) {
    const result = await this.authService.refreshTokens(data.refreshToken);
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      userId: result.user.id,
      login: result.user.login,
      role: result.user.role,
      createdAt: result.user.created_at.toISOString(),
    };
  }

  @GrpcMethod('AuthService', 'AddAllowedUser')
  async addAllowedUser(data: {login: string; role: string }) {
    await this.authService.addAllowedUser(data.login, data.role as UserRole);
    return { success: true};
  }

  @GrpcMethod('AuthService', 'DeleteAllowedUser')
  async deleteAllowedUser(data: { userId: string }) {
    await this.authService.deleteAllowedUser(data.userId);
    return { success: true };
  }

  @GrpcMethod('AuthService', 'ChangeUserRole')
  async changeUserRole(data: {userId: string; newRole: string }) {
    await this.authService.changeUserRole(data.userId, data.newRole as UserRole);
    return { success: true};
  }

  @GrpcMethod('AuthService', 'ChangeLogin')
  async changeLogin(data: { userId: string; newLogin: string }) {
    await this.authService.changeLogin(data.userId, data.newLogin);
    return {
      success: true,
    };
  }

  @GrpcMethod('AuthService', 'ChangePassword')
  async changePassword(data: {
    userId: string;
    currentPassword: string;
    newPassword: string;
  }) {
    await this.authService.changePassword(
      data.userId,
      data.currentPassword,
      data.newPassword
    );
    return {
      success: true,
    };
  }

  @GrpcMethod('AuthService', 'DeleteAccount')
  async deleteAccount(data: { userId: string }) {
    await this.authService.deleteAccount(data.userId);
    return {
      success: true,
    };
  }

  @GrpcMethod('AuthService', 'Verify')
  async verify(data: {
    token: string;
  }): Promise<{ valid: boolean; userId?: string; role?: UserRole }> {
    const result = await this.authService.verify(data.token);
    return { valid: result.valid, userId: result.userId, role: result.role };
  }

  @GrpcMethod('AuthService', 'GetAllowedUsers')
  async getAllowedUsers(): Promise<{ users: AllowedUser[] }> {
    const users = await this.authService.getAllowedUsers();
    return { users };
  }

  @GrpcMethod('AuthService', 'GetUsers')
  async getUsers(): Promise<{ users: Omit<User, 'password' | 'createdAt'>[] }> {
    const users = await this.authService.getUsers();
    return { users };
  }
}
