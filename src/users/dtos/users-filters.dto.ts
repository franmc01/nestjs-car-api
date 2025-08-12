import { IsOptional, IsEmail } from 'class-validator';

export class UsersFiltersDto {
  @IsOptional()
  @IsEmail()
  email?: string;
}
