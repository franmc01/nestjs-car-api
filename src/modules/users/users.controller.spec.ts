import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './users.entity';
import { FindUsersDto } from './dtos/find-users.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

const aUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 1,
    email: 'user@example.com',
    password: 'hashed',
    version: 1,
    ...overrides,
  }) as User;

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findOneById: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            signin: jest.fn(),
            signup: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(UsersController);
    usersService = module.get(UsersService);
    authService = module.get(AuthService);

    jest.clearAllMocks();
  });

  describe('POST /login', () => {
    it('Given credenciales válidas, When login, Then setea session.userId y retorna usuario', async () => {
      const user = aUser({ id: 42, email: 'login@example.com' });
      authService.signin.mockResolvedValue(user);
      const session: Record<string, any> = {};

      const result = await controller.login(
        { email: 'login@example.com', password: 'secret' },
        session,
      );

      expect(result).toEqual(user);
      expect(session.userId).toBe(42);
      expect(authService.signin).toHaveBeenCalledWith(
        'login@example.com',
        'secret',
      );
    });
  });

  describe('POST /register', () => {
    it('Given datos válidos, When register, Then setea session.userId y retorna usuario', async () => {
      const user = aUser({ id: 7, email: 'new@example.com' });
      authService.signup.mockResolvedValue(user);
      const session: Record<string, any> = {};

      const result = await controller.register(
        { email: 'new@example.com', password: 'pass1234' },
        session,
      );

      expect(result).toEqual(user);
      expect(session.userId).toBe(7);
      expect(authService.signup).toHaveBeenCalledWith(
        'new@example.com',
        'pass1234',
      );
    });
  });

  describe('GET /logout', () => {
    it('Given req con userId, When logout, Then lo limpia y responde OK', () => {
      const req: any = { userId: 99 };
      const res = controller.logout(req);

      expect(req.userId).toBeNull();
      expect(res).toEqual({ message: 'Logged out successfully' });
    });
  });

  describe('GET /me', () => {
    it('Given usuario actual inyectado, When me, Then retorna el usuario', async () => {
      const user = aUser({ id: 3, email: 'me@example.com' });
      const res = await controller.me(user);
      expect(res).toEqual(user);
    });
  });

  describe('POST /signup', () => {
    it('Given body válido, When createUser, Then delega a UsersService.create', async () => {
      const created = aUser({ id: 55, email: 'c@example.com' });
      usersService.create.mockResolvedValue(created);

      const res = await controller.createUser({
        email: 'c@example.com',
        password: 'x',
      });

      expect(res).toEqual(created);
      expect(usersService.create).toHaveBeenCalledWith({
        email: 'c@example.com',
        password: 'x',
      });
    });
  });

  describe('GET /:id', () => {
    it('Given id, When findUser, Then retorna usuario', async () => {
      const user = aUser({ id: 10, email: 'u@example.com' });
      usersService.findOneById.mockResolvedValue(user);

      const res = await controller.findUser(10);

      expect(res).toEqual(user);
      expect(usersService.findOneById).toHaveBeenCalledWith(10);
    });
  });

  describe('GET /', () => {
    it('Given dto de búsqueda, When findAllUsers, Then retorna paginado', async () => {
      const dto: FindUsersDto = { offset: 0, limit: 20 };
      const paginated = {
        items: [aUser({ id: 1 }), aUser({ id: 2 })],
        total: 2,
        offset: 0,
        limit: 20,
      };
      usersService.find.mockResolvedValue(paginated);

      const res = await controller.findAllUsers(dto);

      expect(res).toEqual(paginated);
      expect(usersService.find).toHaveBeenCalledWith(dto);
    });
  });

  describe('DELETE /:id', () => {
    it('Given id, When deleteUser, Then delega a UsersService.delete', async () => {
      usersService.delete.mockResolvedValue({ affected: 1 } as any);

      const res = await controller.deleteUser(5);

      expect(res).toEqual({ affected: 1 });
      expect(usersService.delete).toHaveBeenCalledWith(5);
    });
  });

  describe('PATCH /:id', () => {
    it('Given id y body, When updateUser, Then delega a UsersService.update', async () => {
      const payload: UpdateUserDto = { email: 'updated@example.com' } as any;
      const updated = aUser({ id: 6, email: 'updated@example.com' });
      usersService.update.mockResolvedValue(updated);

      const res = await controller.updateUser(6, payload);

      expect(res).toEqual(updated);
      expect(usersService.update).toHaveBeenCalledWith(6, payload);
    });
  });
});
