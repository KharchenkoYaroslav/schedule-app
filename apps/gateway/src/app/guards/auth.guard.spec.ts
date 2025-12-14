import { Test, TestingModule } from '@nestjs/testing';
import { RestAuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { UserRole } from '../dto/auth/types/user-role.enum';

interface MockAuthService {
  verify: jest.Mock;
}

interface MockClientGrpc {
  getService: jest.Mock;
}

type MockReflector = Partial<Record<keyof Reflector, jest.Mock>>;

describe('RestAuthGuard', () => {
  let guard: RestAuthGuard;
  let reflector: MockReflector;
  let authService: MockAuthService;

  beforeEach(async () => {
    authService = {
      verify: jest.fn(),
    };

    const mockClientGrpc: MockClientGrpc = {
      getService: jest.fn().mockReturnValue(authService),
    };

    const mockReflector: MockReflector = {
      getAllAndOverride: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestAuthGuard,
        {
          provide: 'AUTH_PACKAGE',
          useValue: mockClientGrpc,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    guard = module.get<RestAuthGuard>(RestAuthGuard);
    reflector = module.get(Reflector) as unknown as MockReflector;

    guard.onModuleInit();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  const createMockContext = (headers: Record<string, string | undefined> = {}) => {
    const request = {
      headers,
      user: undefined,
    };

    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('повинен повернути true, якщо ролі не задані, АЛЕ токен валідний', async () => {
      reflector.getAllAndOverride?.mockReturnValue(null);
      const context = createMockContext({ authorization: 'Bearer validToken' });

      authService.verify.mockReturnValue(of({
        valid: true,
        userId: '123',
        role: UserRole.USER
      }));

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      const req = context.switchToHttp().getRequest();
      expect(req.user).toEqual({ sub: '123', role: UserRole.USER });
    });

    it('повинен викинути UnauthorizedException, якщо відсутній заголовок authorization (навіть без ролей)', async () => {
      reflector.getAllAndOverride?.mockReturnValue(null); 
      const context = createMockContext({});

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('повинен викинути UnauthorizedException, якщо тип токена не Bearer', async () => {
      const context = createMockContext({ authorization: 'Basic someToken' });
      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('повинен викинути UnauthorizedException, якщо токен невалідний', async () => {
      const context = createMockContext({ authorization: 'Bearer invalidToken' });
      authService.verify.mockReturnValue(of({ valid: false }));

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('повинен викинути UnauthorizedException, якщо виникла помилка RPC', async () => {
      const context = createMockContext({ authorization: 'Bearer token' });
      authService.verify.mockReturnValue(throwError(() => new Error('RPC Error')));

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });

    it('повинен повернути true, якщо авторизація успішна та роль підходить', async () => {
      const requiredRoles = [UserRole.ADMIN];
      reflector.getAllAndOverride?.mockReturnValue(requiredRoles);

      const context = createMockContext({ authorization: 'Bearer validToken' });

      authService.verify.mockReturnValue(of({
        valid: true,
        userId: '123',
        role: UserRole.ADMIN,
      }));

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('повинен викинути UnauthorizedException, якщо роль користувача недостатня', async () => {
      const requiredRoles = [UserRole.SUPER_ADMIN];
      reflector.getAllAndOverride?.mockReturnValue(requiredRoles);

      const context = createMockContext({ authorization: 'Bearer validToken' });

      authService.verify.mockReturnValue(of({
        valid: true,
        userId: '123',
        role: UserRole.ADMIN,
      }));

      await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
    });
  });
});
