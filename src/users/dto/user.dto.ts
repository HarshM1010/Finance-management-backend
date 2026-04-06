import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Role, Status } from '../../../prisma/generated/prisma/enums';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password!: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role!: Role;
}

export class UpdateUserStatusDto {
  @IsEnum(Status)
  @IsNotEmpty()
  status!: Status;
}

export class UpdateUserRoleDto {
  @IsEnum(Role)
  @IsNotEmpty()
  role!: Role;
}
