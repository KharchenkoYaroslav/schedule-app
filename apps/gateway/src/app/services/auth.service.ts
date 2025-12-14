import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom, catchError } from 'rxjs';
import { status } from '@grpc/grpc-js'; // Додайте цей імпорт
import { LoginInput } from '../dto/auth/input/login.input';
import { RegisterInput } from '../dto/auth/input/register.input';
import { ChangeLoginInput } from '../dto/auth/input/change-login.input';
import { ChangePasswordInput } from '../dto/auth/input/change-password.input';
import { LoginResponse } from '../dto/auth/response/login.response';
import { UsersResponseDto } from '../dto/auth/response/users.response';
import { AddAllowedUserInput } from '../dto/auth/input/add-allowed-user.input';
import { ChangeUserRoleInput } from '../dto/auth/input/change-user-role.input';
import { VerifyResponse } from '../dto/auth/response/verify.response';
import { RefreshInput } from '../dto/auth/input/refresh.input';

interface AuthServiceGrpc {
  login(data: LoginInput): Observable<LoginResponse>;
  logout(data: { userId: string }): Observable<{ success: boolean }>; 
  verify(data: { token: string }): Observable<VerifyResponse>;
  register(data: RegisterInput): Observable<LoginResponse>;
  changeLogin(data: ChangeLoginInput & { userId: string }): Observable<{ success: boolean }>;
  changePassword(data: ChangePasswordInput & { userId: string }): Observable<{ success: boolean }>;
  deleteAccount(data: { userId: string }): Observable<{ success: boolean }>;
  addAllowedUser(data: AddAllowedUserInput): Observable<{ success: boolean }>;
  deleteAllowedUser(data: { userId: string }): Observable<{ success: boolean }>;
  changeUserRole(data: ChangeUserRoleInput): Observable<{ success: boolean }>;
  getUsers(data: object): Observable<UsersResponseDto>;
  getAllowedUsers(data: object): Observable<UsersResponseDto>;
  refresh(data: RefreshInput): Observable<LoginResponse>;
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
        throw new HttpException(error.details || error.message, HttpStatus.UNAUTHORIZED);
      })
    ));
  }

  async logout(userId: string) {
    return firstValueFrom(this.authService.logout({ userId }).pipe(
      catchError(error => {
        throw new HttpException(error.details || error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    ));
  }

  async refresh(data: RefreshInput) {
    return firstValueFrom(this.authService.refresh(data).pipe(
      catchError(error => {
        throw new HttpException(error.details || error.message, HttpStatus.UNAUTHORIZED);
      })
    ));
  }

  async register(data: RegisterInput) {
    return firstValueFrom(this.authService.register(data).pipe(
      catchError(error => {
        // БЕЗПЕКА: Перевірка коду статусу замість тексту повідомлення
        if (error.code === status.PERMISSION_DENIED) {
             throw new HttpException(error.details || error.message, HttpStatus.FORBIDDEN);
        }
        if (error.code === status.ALREADY_EXISTS) {
            throw new HttpException(error.details || error.message, HttpStatus.CONFLICT);
        }
        throw new HttpException(error.details || error.message, HttpStatus.BAD_REQUEST);
      })
    ));
  }

  async changeLogin(data: ChangeLoginInput & { userId: string }) {
    await firstValueFrom(this.authService.changeLogin(data).pipe(
      catchError(error => {
        if (error.code === status.ALREADY_EXISTS) {
            throw new HttpException(error.details || error.message, HttpStatus.CONFLICT);
        }
        throw new HttpException(error.details || error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    ));
  }

  async changePassword(data: ChangePasswordInput & { userId: string }) {
    await firstValueFrom(
      this.authService.changePassword(data).pipe(
        catchError(error => {
          throw new HttpException(error.details || error.message, HttpStatus.UNAUTHORIZED);
        })
      )
    );
  }

  async deleteAccount(data: { userId: string }) {
    await firstValueFrom(this.authService.deleteAccount(data).pipe(
      catchError(error => {
        throw new HttpException(error.details || error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    ));
  }

  async verify(data: { token: string }) {
    const response = await firstValueFrom(this.authService.verify(data).pipe(
      catchError(error => {
        throw new HttpException(error.details || error.message, HttpStatus.UNAUTHORIZED);
      })
    ));
    return { valid: response.valid, role: response.role, userId: response.userId };
  }

  async addAllowedUser(data: AddAllowedUserInput) {
    await firstValueFrom(this.authService.addAllowedUser(data).pipe(
      catchError(error => {
        if (error.code === status.ALREADY_EXISTS) {
             throw new HttpException(error.details || error.message, HttpStatus.CONFLICT);
        }
        throw new HttpException(error.details || error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    ));
  }

  async deleteAllowedUser(data: { userId: string }) {
    await firstValueFrom(this.authService.deleteAllowedUser(data).pipe(
      catchError(error => {
        if (error.code === status.NOT_FOUND) {
            throw new HttpException(error.details || error.message, HttpStatus.NOT_FOUND);
        }
        throw new HttpException(error.details || error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    ));
  }

  async changeUserRole(data: ChangeUserRoleInput) {
    await firstValueFrom(this.authService.changeUserRole(data).pipe(
      catchError(error => {
        if (error.code === status.NOT_FOUND) {
            throw new HttpException(error.details || error.message, HttpStatus.NOT_FOUND);
        }
        throw new HttpException(error.details || error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    ));
  }

  async getUsers() {
    return firstValueFrom(this.authService.getUsers({}).pipe(
      catchError(error => {
        throw new HttpException(error.details || error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    ));
  }

  async getAllowedUsers() {
    return firstValueFrom(this.authService.getAllowedUsers({}).pipe(
      catchError(error => {
        throw new HttpException(error.details || error.message, HttpStatus.INTERNAL_SERVER_ERROR);
      })
    ));
  }
}
