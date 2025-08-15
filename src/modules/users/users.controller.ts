import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Session,
  Req,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { FindUsersDto } from './dtos/find-users.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Serialize } from '../../shared/interceptors/serialize/serialize.interceptor';
import { UserPublicDto } from './dtos/user-public.dto';
import { PaginatedUsersDto } from './dtos/paginated-users-dto';
import { AuthService } from './auth.service';

@Controller('users/auth')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('/login')
  async login(
    @Body() body: CreateUserDto,
    @Session() session: Record<string, any>,
  ) {
    const user = await this.authService.signin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Serialize(UserPublicDto)
  @Post('/register')
  async register(
    @Body() body: CreateUserDto,
    @Session() session: Record<string, any>,
  ) {
    const user = await this.authService.signup(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  // @Get('/logout')
  // logout(@Session() session: Record<string, any>) {
  //   session.userId = null;
  //   return { message: 'Logged out successfully' };
  // }

  @Get('/logout')
  logout(@Req() req: any) {
    req.userId = null;
    return { message: 'Logged out successfully' };
  }

  @Get('/me')
  async me(@Session() session: Record<string, any>) {
    return await this.usersService.findOneById(session.userId);
  }

  @Post('/signup')
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Serialize(UserPublicDto)
  @Get(':id(\\d+)')
  findUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  @Serialize(PaginatedUsersDto)
  @Get()
  findAllUsers(@Query() dto: FindUsersDto) {
    return this.usersService.find(dto);
  }

  @Delete('/:id(\\d+)')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }

  @Patch('/:id(\\d+)')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(id, body);
  }
}
