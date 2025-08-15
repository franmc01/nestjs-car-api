import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { AuthService } from './auth.service';
import { APP_FILTER } from '@nestjs/core';

import { OptimisticLockFilter } from '../../shared/filters/optimistic-lock/optimistic-lock.filter';
import { Argon2HasherService } from '../../shared/services/argon2-hasher.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    AuthService,
    {
      provide: 'IPasswordHasher',
      useClass: Argon2HasherService,
    },
    {
      provide: APP_FILTER,
      useClass: OptimisticLockFilter,
    },
  ],
  imports: [TypeOrmModule.forFeature([User])],
})
export class UsersModule {}
