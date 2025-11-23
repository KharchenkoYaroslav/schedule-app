import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
  SetMetadata,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom } from 'rxjs';
import { UserRole } from '../dto/auth/types/user-role.enum';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

interface AuthServiceGrpc {
  verify(data: {
    token: string;
  }): Observable<{ valid: boolean; userId: string; role: UserRole }>;
}

@Injectable()
export class RestAuthGuard implements CanActivate {
  private authService!: AuthServiceGrpc;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc, private reflector: Reflector) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer') {
      throw new UnauthorizedException('Invalid authorization type');
    }

    try {
      const response = await firstValueFrom(
        this.authService.verify({ token })
      );

      if (!response.valid) {
        throw new UnauthorizedException('Invalid token');
      }
      req.user = { sub: response.userId, role: response.role };

      const hasRole = requiredRoles.some((role) => response.role === role);
      if (!hasRole) {
        throw new UnauthorizedException('Insufficient role');
      }

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token' + error);
    }
  }
}
