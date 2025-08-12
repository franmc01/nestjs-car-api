import { IntersectionType } from '@nestjs/mapped-types';
import { PaginationDto } from '../../dtos/pagination.dto';
import { UsersFiltersDto } from './users-filters.dto';

export class FindUsersDto extends IntersectionType(
  UsersFiltersDto,
  PaginationDto,
) {}
