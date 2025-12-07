import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './app.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AllowedUser } from './entities/allowed-users.entity';
import { UserRole } from './entities/user-role.enum';
import { RpcException } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

type MockRepository<T = unknown> = Partial<Record<keyof Repository<T>, jest.Mock>>;
type MockJwtService = Partial<Record<keyof JwtService, jest.Mock>>;

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: MockJwtService;
  let usersRepository: MockRepository<User>;
  let allowedUsersRepository: MockRepository<AllowedUser>;

  const mockUsersRepository: MockRepository<User> = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
  };

  const mockAllowedUsersRepository: MockRepository<AllowedUser> = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    find: jest.fn(),
  };

  const mockJwtService: MockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository,
        },
        {
          provide: getRepositoryToken(AllowedUser),
          useValue: mockAllowedUsersRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService) as unknown as MockJwtService;
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User)) as unknown as MockRepository<User>;
    allowedUsersRepository = module.get<Repository<AllowedUser>>(getRepositoryToken(AllowedUser)) as unknown as MockRepository<AllowedUser>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const login = 'testUser';
    const password = 'plainPassword';
    const hashedPassword = 'hashedPassword';
    const mockUser = {
      id: 'uuid-1',
      login,
      password: hashedPassword,
      role: UserRole.ADMIN,
      created_at: new Date(),
    } as User;

    it('повинен повернути дані користувача, якщо пароль вірний', async () => {
      usersRepository.findOne?.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(login, password);

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { login } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual({
        id: mockUser.id,
        login: mockUser.login,
        createdAt: mockUser.created_at,
        role: mockUser.role,
      });
    });

    it('повинен повернути null, якщо користувача не знайдено', async () => {
      usersRepository.findOne?.mockResolvedValue(null);

      const result = await service.validateUser(login, password);

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('повинен повернути null, якщо пароль невірний', async () => {
      usersRepository.findOne?.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(login, password);

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('повинен згенерувати та повернути JWT токен', async () => {
      const user = {
        id: 'uuid-1',
        login: 'testUser',
        createdAt: new Date(),
        role: UserRole.ADMIN,
      };
      const token = 'generated-jwt-token';

      jwtService.sign?.mockReturnValue(token);

      const result = await service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({
        login: user.login,
        sub: user.id,
      });
      expect(result).toBe(token);
    });
  });

  describe('register', () => {
    const login = 'newUser';
    const password = 'newPassword';
    const allowedUser = {
      id: 'uuid-allowed',
      login,
      role: UserRole.ADMIN,
    } as AllowedUser;

    it('повинен успішно зареєструвати користувача', async () => {
      allowedUsersRepository.findOne?.mockResolvedValue(allowedUser);
      usersRepository.findOne?.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');

      const savedUser = {
        id: allowedUser.id,
        login,
        role: allowedUser.role,
        password: 'hashedPassword',
        created_at: new Date(),
      } as User;

      usersRepository.create?.mockReturnValue(savedUser);
      usersRepository.save?.mockResolvedValue(savedUser);

      const result = await service.register(login, password);

      expect(allowedUsersRepository.findOne).toHaveBeenCalledWith({ where: { login } });
      expect(usersRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        login,
        role: allowedUser.role,
        password: 'hashedPassword',
      }));
      expect(usersRepository.save).toHaveBeenCalledWith(savedUser);
      expect(allowedUsersRepository.remove).toHaveBeenCalledWith(allowedUser);
      expect(result).toEqual(savedUser);
    });

    it('повинен викинути помилку, якщо реєстрація не дозволена', async () => {
      allowedUsersRepository.findOne?.mockResolvedValue(null);

      await expect(service.register(login, password)).rejects.toThrow(RpcException);
    });

    it('повинен викинути помилку, якщо користувач вже існує', async () => {
      allowedUsersRepository.findOne?.mockResolvedValue(allowedUser);
      usersRepository.findOne?.mockResolvedValue({ id: 'existing-id' } as User);

      await expect(service.register(login, password)).rejects.toThrow(RpcException);
    });
  });

  describe('verify', () => {
    const token = 'valid.token';
    const payload = { sub: 'user-uuid', login: 'user' };
    const user = { id: 'user-uuid', role: UserRole.ADMIN } as User;

    it('повинен успішно веріфікувати токен', async () => {
      jwtService.verify?.mockReturnValue(payload);
      usersRepository.findOne?.mockResolvedValue(user);

      const result = await service.verify(token);

      expect(jwtService.verify).toHaveBeenCalledWith(token);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: payload.sub } });
      expect(result).toEqual({ valid: true, userId: user.id, role: user.role });
    });

    it('повинен викинути помилку, якщо токен невалідний', async () => {
      jwtService.verify?.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(service.verify(token)).rejects.toThrow(RpcException);
    });

    it('повинен викинути помилку, якщо користувача з токена не знайдено', async () => {
      jwtService.verify?.mockReturnValue(payload);
      usersRepository.findOne?.mockResolvedValue(null);

      await expect(service.verify(token)).rejects.toThrow(RpcException);
    });
  });

  describe('addAllowedUser', () => {
    const login = 'newAllowedUser';
    const role = UserRole.ADMIN;

    it('повинен успішно додати дозволеного користувача з валідною роллю', async () => {
      allowedUsersRepository.findOne?.mockResolvedValue(null);
      allowedUsersRepository.create?.mockReturnValue({ login, role } as AllowedUser);
      allowedUsersRepository.save?.mockResolvedValue({ id: 'id', login, role } as AllowedUser);

      await service.addAllowedUser(login, role);

      expect(allowedUsersRepository.findOne).toHaveBeenCalledWith({ where: { login } });
      expect(allowedUsersRepository.create).toHaveBeenCalledWith({ login, role });
      expect(allowedUsersRepository.save).toHaveBeenCalled();
    });

    it('повинен викинути помилку RpcException, якщо передано невалідну роль', async () => {
      const invalidRole = 'INVALID_ROLE' as unknown as UserRole;

      await expect(service.addAllowedUser(login, invalidRole)).rejects.toThrow(RpcException);
      expect(allowedUsersRepository.save).not.toHaveBeenCalled();
    });

    it('повинен викинути помилку, якщо користувач вже є в списку дозволених', async () => {
      allowedUsersRepository.findOne?.mockResolvedValue({ id: 'existing-id' } as AllowedUser);

      await expect(service.addAllowedUser(login, role)).rejects.toThrow(RpcException);
    });
  });

  describe('changeUserRole', () => {
    const userId = 'user-uuid';
    const newRole = UserRole.SUPER_ADMIN;

    it('повинен успішно змінити роль існуючого користувача', async () => {
      const user = { id: userId, role: UserRole.ADMIN } as User;
      usersRepository.findOne?.mockResolvedValue(user);
      usersRepository.save?.mockResolvedValue({ ...user, role: newRole } as User);

      await service.changeUserRole(userId, newRole);

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(user.role).toBe(newRole);
      expect(usersRepository.save).toHaveBeenCalledWith(user);
    });

    it('повинен викинути помилку RpcException при спробі встановити невалідну роль', async () => {
      const invalidRole = 'SUPER_GOD_MODE' as unknown as UserRole;

      await expect(service.changeUserRole(userId, invalidRole)).rejects.toThrow(RpcException);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('повинен викинути помилку, якщо користувача не знайдено', async () => {
      usersRepository.findOne?.mockResolvedValue(null);

      await expect(service.changeUserRole(userId, newRole)).rejects.toThrow(RpcException);
    });
  });

  describe('changeLogin', () => {
    const userId = 'user-uuid';
    const newLogin = 'newLogin';

    it('повинен успішно змінити логін', async () => {
      usersRepository.findOne?.mockResolvedValueOnce(null);
      const user = { id: userId, login: 'oldLogin' } as User;
      usersRepository.findOne?.mockResolvedValueOnce(user);

      await service.changeLogin(userId, newLogin);

      expect(usersRepository.findOne).toHaveBeenNthCalledWith(1, { where: { login: newLogin } });
      expect(usersRepository.findOne).toHaveBeenNthCalledWith(2, { where: { id: userId } });
      expect(user.login).toBe(newLogin);
      expect(usersRepository.save).toHaveBeenCalledWith(user);
    });

    it('повинен викинути помилку, якщо новий логін вже зайнятий', async () => {
      usersRepository.findOne?.mockResolvedValueOnce({ id: 'other-user' } as User);

      await expect(service.changeLogin(userId, newLogin)).rejects.toThrow(RpcException);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });

    it('повинен викинути помилку, якщо користувача не знайдено', async () => {
      usersRepository.findOne?.mockResolvedValueOnce(null); 
      usersRepository.findOne?.mockResolvedValueOnce(null);

      await expect(service.changeLogin(userId, newLogin)).rejects.toThrow(RpcException);
    });
  });

  describe('changePassword', () => {
    const userId = 'user-uuid';
    const currentPassword = 'oldPass';
    const newPassword = 'newPass';
    const hashedPassword = 'hashedOldPass';

    it('повинен успішно змінити пароль', async () => {
      const user = { id: userId, password: hashedPassword } as User;
      usersRepository.findOne?.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedNewPass');

      await service.changePassword(userId, currentPassword, newPassword);

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(bcrypt.compare).toHaveBeenCalledWith(currentPassword, hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(user.password).toBe('hashedNewPass');
      expect(usersRepository.save).toHaveBeenCalledWith(user);
    });

    it('повинен викинути помилку, якщо користувача не знайдено', async () => {
      usersRepository.findOne?.mockResolvedValue(null);

      await expect(service.changePassword(userId, currentPassword, newPassword)).rejects.toThrow(RpcException);
    });

    it('повинен викинути помилку, якщо поточний пароль невірний', async () => {
      const user = { id: userId, password: hashedPassword } as User;
      usersRepository.findOne?.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword(userId, currentPassword, newPassword)).rejects.toThrow(RpcException);
      expect(usersRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteAllowedUser', () => {
    const allowedUserId = 'allowed-uuid';

    it('повинен успішно видалити дозволеного користувача', async () => {
      const allowedUser = { id: allowedUserId } as AllowedUser;
      allowedUsersRepository.findOne?.mockResolvedValue(allowedUser);

      await service.deleteAllowedUser(allowedUserId);

      expect(allowedUsersRepository.findOne).toHaveBeenCalledWith({ where: { id: allowedUserId } });
      expect(allowedUsersRepository.remove).toHaveBeenCalledWith(allowedUser);
    });

    it('повинен викинути помилку, якщо allowed user не знайдено', async () => {
      allowedUsersRepository.findOne?.mockResolvedValue(null);

      await expect(service.deleteAllowedUser(allowedUserId)).rejects.toThrow(RpcException);
      expect(allowedUsersRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('getAllowedUsers', () => {
    it('повинен повернути список дозволених користувачів', async () => {
      const expectedUsers = [{ id: '1', login: 'u1' }] as AllowedUser[];
      allowedUsersRepository.find?.mockResolvedValue(expectedUsers);

      const result = await service.getAllowedUsers();

      expect(allowedUsersRepository.find).toHaveBeenCalled();
      expect(result).toBe(expectedUsers);
    });
  });

  describe('getUsers', () => {
    it('повинен повернути список користувачів (без паролів)', async () => {
      const expectedUsers = [{ id: '1', login: 'u1', role: UserRole.ADMIN }] as User[];
      usersRepository.find?.mockResolvedValue(expectedUsers);

      const result = await service.getUsers();

      expect(usersRepository.find).toHaveBeenCalledWith({
        select: ['id', 'login', 'role'],
      });
      expect(result).toBe(expectedUsers);
    });
  });

  describe('deleteAccount', () => {
    const userId = 'user-uuid';

    it('повинен успішно видалити акаунт', async () => {
      const user = { id: userId } as User;
      usersRepository.findOne?.mockResolvedValue(user);

      await service.deleteAccount(userId);

      expect(usersRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(usersRepository.remove).toHaveBeenCalledWith(user);
    });

    it('повинен викинути помилку, якщо користувача не знайдено', async () => {
      usersRepository.findOne?.mockResolvedValue(null);

      await expect(service.deleteAccount(userId)).rejects.toThrow(RpcException);
      expect(usersRepository.remove).not.toHaveBeenCalled();
    });
  });
});
