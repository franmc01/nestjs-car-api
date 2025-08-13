import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Not, OptimisticLockVersionMismatchError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './users.entity';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { FindUsersDto } from './dtos/find-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto) {
    dto.email = dto.email.toLowerCase().trim();

    const exists = await this.repository.exists({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('User already exists');

    const user = this.repository.create(dto);
    return await this.repository.save(user);
  }

  async findOne(id: number) {
    const user = await this.repository.findOne({
      where: { id },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async find(dto: FindUsersDto) {
    const { offset = 0, limit = 20, ...filters } = dto;
    const [items, total] = await this.repository.findAndCount({
      where: filters,
      skip: offset,
      take: Math.min(limit ?? 20, 100),
      order: { id: 'ASC' },
    });
    return {
      items,
      total,
      limit: Math.min(limit ?? 20, 100),
      offset,
    };
  }

  async update(id: number, dto: UpdateUserDto) {
    if (dto.email) dto.email = dto.email.toLowerCase().trim();

    if (dto.email) {
      const exists = await this.repository.exists({
        where: { email: dto.email, id: Not(id) },
      });
      if (exists) throw new ConflictException('User already exists');
    }

    const user = await this.repository.preload({ id, ...dto });
    if (!user) throw new NotFoundException('User not found');

    try {
      return await this.repository.save(user);
    } catch (e) {
      if (e instanceof OptimisticLockVersionMismatchError) {
        throw new ConflictException(
          'User was modified by another request. Please reload and try again.',
        );
      }
      throw e; //TODO: manejar globalmente en un Exception Filter
    }
  }

  async delete(id: number) {
    const result = await this.repository.softDelete(id);
    if (!result.affected) throw new NotFoundException('User not found');
    return { message: `User with id ${id} deleted successfully` };
  }
}
