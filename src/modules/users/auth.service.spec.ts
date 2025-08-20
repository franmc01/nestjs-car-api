import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { IPasswordHasher } from '../../shared/interfaces/IPasswordHasher';
import { UnauthorizedException } from '@nestjs/common';
import { User } from './users.entity';

const aUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword123',
    version: 1,
    ...overrides,
  }) as User;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let passwordHasher: jest.Mocked<IPasswordHasher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOneByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: 'IPasswordHasher',
          useValue: {
            hashPassword: jest.fn(),
            verifyPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    passwordHasher = module.get(
      'IPasswordHasher',
    ) as jest.Mocked<IPasswordHasher>;

    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('Given valid email/password, When signup, Then creates user with hashed password', async () => {
      const HASH = 'hashedPassword';
      const EMAIL = 'test@test.com';
      const created = aUser({ email: EMAIL, password: HASH });

      passwordHasher.hashPassword.mockResolvedValue(HASH);
      usersService.create.mockResolvedValue(created);

      const result = await service.signup(EMAIL, 'prueba1234567890');

      expect(result).toEqual(created);
      expect(passwordHasher.hashPassword).toHaveBeenCalledWith(
        'prueba1234567890',
      );
      expect(usersService.create).toHaveBeenCalledWith({
        email: EMAIL,
        password: HASH,
      });
    });
  });

  describe('signin', () => {
    it('Given existing user and valid password, When signin, Then returns user', async () => {
      const user = aUser();
      usersService.findOneByEmail.mockResolvedValue(user);
      passwordHasher.verifyPassword.mockResolvedValue(true);

      const result = await service.signin(user.email, 'prueba1234567890');

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(user.email);
      expect(passwordHasher.verifyPassword).toHaveBeenCalledWith(
        'prueba1234567890',
        user.password,
      );
      expect(result).toEqual(user);
    });

    it('Given user not found, When signin, Then throws UnauthorizedException', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);

      await expect(
        service.signin('random@test.com', 'password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('Given invalid password, When signin, Then throws UnauthorizedException', async () => {
      const user = aUser();
      usersService.findOneByEmail.mockResolvedValue(user);
      passwordHasher.verifyPassword.mockResolvedValue(false);

      await expect(service.signin(user.email, 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );

      expect(usersService.findOneByEmail).toHaveBeenCalledWith(user.email);
      expect(passwordHasher.verifyPassword).toHaveBeenCalledWith(
        'wrong',
        user.password,
      );
    });
  });
});
