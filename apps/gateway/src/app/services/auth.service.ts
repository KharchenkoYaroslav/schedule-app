import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom, catchError } from 'rxjs';
import { LoginInput } from '../dto/auth/input/login.input';
import { RegisterInput } from '../dto/auth/input/register.input';
import { ChangeLoginInput } from '../dto/auth/input/change-login.input';
import { ChangePasswordInput } from '../dto/auth/input/change-password.input';
import { LoginResponse } from '../dto/auth/response/login.response';
import { UsersResponseDto } from '../dto/auth/response/users.response';
import { AddAllowedUserInput } from '../dto/auth/input/add-allowed-user.input';
import { ChangeUserRoleInput } from '../dto/auth/input/change-user-role.input';
import { VerifyResponse } from '../dto/auth/response/verify.response';

interface AuthServiceGrpc {
  login(data: LoginInput): Observable<LoginResponse>;
  verify(data: { token: string }): Observable<VerifyResponse>;
  register(data: RegisterInput): Observable<LoginResponse>;
  changeLogin(data: ChangeLoginInput): Observable<{ success: boolean }>;
  changePassword(data: ChangePasswordInput): Observable<{ success: boolean }>;
  deleteAccount(data: { userId: string }): Observable<{ success: boolean }>;
  addAllowedUser(data: AddAllowedUserInput): Observable<{ success: boolean }>;
  changeUserRole(data: ChangeUserRoleInput): Observable<{ success: boolean }>;
  getUsers(data: object): Observable<UsersResponseDto>;
  getAllowedUsers(data: object): Observable<UsersResponseDto>;
}

@Injectable()
export class AuthService {
  private authService!: AuthServiceGrpc;

  constructor(@Inject('AUTH_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceGrpc>('AuthService');
  }

  async login(data: LoginInput) {
    return firstValueFrom(this.authService.login(data).pipe(
      catchError(error => {
        throw new HttpException(error, HttpStatus.UNAUTHORIZED);
      })
    ));
  }

  async register(data: RegisterInput) {
    return firstValueFrom(this.authService.register(data).pipe(
      catchError(error => {
        if (error.message === '7 PERMISSION_DENIED: Registration not allowed for this login.') {
          throw new HttpException(error.message, HttpStatus.FORBIDDEN);
        }
        throw new HttpException(error, HttpStatus.CONFLICT);
      })
    ));
  }

  async changeLogin(data: ChangeLoginInput & { userId: string }) {
    await firstValueFrom(this.authService.changeLogin(data).pipe(
      catchError(error => {
        throw new HttpException(error, HttpStatus.CONFLICT);
      })
    ));
  }

  async changePassword(data: ChangePasswordInput & { userId: string }) {
    await firstValueFrom(
      this.authService.changePassword(data).pipe(
        catchError(error => {
          throw new HttpException(error, HttpStatus.UNAUTHORIZED);
        })
      )
    );
  }

  async deleteAccount(data: { userId: string }) {
    await firstValueFrom(this.authService.deleteAccount(data).pipe(
      catchError(error => {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    ));
  }

  async verify(data: { token: string }) {
    const response = await firstValueFrom(this.authService.verify(data).pipe(
      catchError(error => {
        throw new HttpException(error, HttpStatus.UNAUTHORIZED);
      })
    ));
    return { valid: response.valid, role: response.role };
  }

  async addAllowedUser(data: AddAllowedUserInput) {
    await firstValueFrom(this.authService.addAllowedUser(data).pipe(
      catchError(error => {
        throw new HttpException(error, HttpStatus.CONFLICT);
      })
    ));
  }

  async changeUserRole(data: ChangeUserRoleInput) {
    await firstValueFrom(this.authService.changeUserRole(data).pipe(
      catchError(error => {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    ));
  }

  async getUsers() {
    return firstValueFrom(this.authService.getUsers({}).pipe(
      catchError(error => {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    ));
  }

  async getAllowedUsers() {
    return firstValueFrom(this.authService.getAllowedUsers({}).pipe(
      catchError(error => {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    ));
  }
}
