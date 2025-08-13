import { Expose } from 'class-transformer';

export class UserBaseDto {
  @Expose() id!: number;
  @Expose() email!: string;
}
