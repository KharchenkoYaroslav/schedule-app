import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../dto/auth/types/user-role.enum';


export interface CurrentUserPayload {
  sub: string;
  login: string;
  role: UserRole;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
