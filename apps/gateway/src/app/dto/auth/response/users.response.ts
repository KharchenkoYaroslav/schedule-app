import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../types/user.dto';

export class UsersResponseDto {
  @ApiProperty({ description: 'List of users', type: [UserDto] })
  users!: UserDto[];
}
