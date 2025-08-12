import { IsOptional, IsInt, Min, Max } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  offset: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}
