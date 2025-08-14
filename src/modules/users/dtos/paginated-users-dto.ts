import { Expose, Type } from 'class-transformer';
import { UserPublicDto } from './user-public.dto';

export class PaginatedUsersDto {
  @Expose()
  @Type(() => UserPublicDto)
  items: UserPublicDto[];

  @Expose()
  total: number;

  @Expose()
  limit: number;

  @Expose()
  offset: number;
}
