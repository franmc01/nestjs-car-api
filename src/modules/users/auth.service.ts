import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { IPasswordHasher } from '../../shared/interfaces/IPasswordHasher';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    @Inject('IPasswordHasher')
    private readonly passwordHasher: IPasswordHasher,
  ) {}

  async signin(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isValid = await this.passwordHasher.verifyPassword(
      password,
      user.password,
    );
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async signup(email: string, password: string) {
    const hashedPassword = await this.passwordHasher.hashPassword(password);
    return await this.usersService.create({ email, password: hashedPassword });
  }
}
