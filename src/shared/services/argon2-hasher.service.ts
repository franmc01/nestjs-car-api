import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';
import { IPasswordHasher } from '../interfaces/IPasswordHasher';

@Injectable()
export class Argon2HasherService implements IPasswordHasher {
  private readonly ARGON_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 2,
    parallelism: 1,
  };

  async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, this.ARGON_OPTIONS);
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, password);
    } catch {
      return false;
    }
  }
}
