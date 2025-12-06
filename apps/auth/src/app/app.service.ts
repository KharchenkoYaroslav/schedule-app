import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { User } from './entities/user.entity';
import { AllowedUser } from './entities/allowed-users.entity';
import { UserRole } from './entities/user-role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(AllowedUser)
    private allowedUsersRepository: Repository<AllowedUser>,
    private jwtService: JwtService,
  ) {}

  private validateRole(role: UserRole): void {
    const validRoles = Object.values(UserRole);
    if (!validRoles.includes(role)) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: `Invalid user role: ${role}. Must be one of: ${validRoles.join(', ')}`,
      });
    }
  }

  async validateUser(
    login: string,
    password: string
  ): Promise<{ id: string; login: string; createdAt: Date; role: UserRole } | null> {
    const user = await this.usersRepository.findOne({ where: { login } });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const { id, created_at, role } = user;
    return { id: id, login: login, createdAt: created_at, role: role };
  }

  async login(user: { id: string; login: string; createdAt: Date }): Promise<string> {
    const payload = { login: user.login, sub: user.id };
    return this.jwtService.sign(payload);
  }

  private async isLoginTaken(login: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { login } });
    return !!user;
  }

  async register(login: string, password: string): Promise<User> {
    const allowedUser = await this.allowedUsersRepository.findOne({ where: { login } });

    if (!allowedUser) {
      throw new RpcException({
        code: status.PERMISSION_DENIED,
        message: 'Registration not allowed for this login.',
      });
    }

    if (await this.isLoginTaken(login)) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'User with this login already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      id: allowedUser.id,
      login: allowedUser.login,
      password: hashedPassword,
      role: allowedUser.role,
      created_at: new Date(),
    });

    const savedUser = await this.usersRepository.save(user);
    await this.allowedUsersRepository.remove(allowedUser);
    return savedUser;
  }

  async changeLogin(userId: string, newLogin: string): Promise<void> {
    if (await this.isLoginTaken(newLogin)) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'User with this login already exists.',
      });
    }

    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found.',
      });
    }

    user.login = newLogin;
    await this.usersRepository.save(user);
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found.',
      });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Current password is incorrect.',
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.save(user);
  }

  async addAllowedUser(login: string, role: UserRole): Promise<void> {
    this.validateRole(role);

    const existingAllowedUser = await this.allowedUsersRepository.findOne({ where: { login } });
    if (existingAllowedUser) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'User with this login is already in the allowed list.',
      });
    }

    const allowedUser = this.allowedUsersRepository.create({ login, role });
    await this.allowedUsersRepository.save(allowedUser);
  }

  async deleteAllowedUser(id: string): Promise<void> {
    const allowedUser = await this.allowedUsersRepository.findOne({ where: { id } });
    if (!allowedUser) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Allowed user not found.',
      });
    }

    await this.allowedUsersRepository.remove(allowedUser);
  }

  async changeUserRole(userId: string, newRole: UserRole): Promise<void> {
    this.validateRole(newRole);

    const userToUpdate = await this.usersRepository.findOne({ where: { id: userId } });
    if (!userToUpdate) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found.',
      });
    }

    userToUpdate.role = newRole;
    await this.usersRepository.save(userToUpdate);
  }

  async getAllowedUsers(): Promise<AllowedUser[]> {
    return this.allowedUsersRepository.find();
  }

  async getUsers(): Promise<Omit<User, 'password' | 'createdAt'>[]> {
    const users = await this.usersRepository.find({
      select: ['id', 'login', 'role'],
    });
    return users;
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'User not found.',
      });
    }

    await this.usersRepository.remove(user);
  }

  async verify(
    token: string
  ): Promise<{ valid: boolean; userId?: string; role?: UserRole }> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersRepository.findOne({ where: { id: payload.sub } });

      if (!user) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'User not found.',
        });
      }

      return { valid: true, userId: payload.sub, role: user.role };
    } catch (error) {

      throw new RpcException({
        code: status.UNAUTHENTICATED,
        message: 'Invalid token or verification failed: ' + error.message,
      });
    }
  }
}
