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
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { FindUsersDto } from './dtos/find-users.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Serialize } from '../../shared/interceptors/serialize/serialize.interceptor';
import { UserPublicDto } from './dtos/user-public.dto';
import { PaginatedUsersDto } from './dtos/paginated-users-dto';
import { AuthService } from "./auth.service";

@Controller('users/auth')
export class UsersController {
  constructor(private readonly usersService: UsersService,private readonly authService: AuthService) {}

  @Post('/signup')
  createUser(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Serialize(UserPublicDto)
  @Get('/:id')
  findUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOneById(id);
  }

  @Serialize(PaginatedUsersDto)
  @Get()
  findAllUsers(@Query() dto: FindUsersDto) {
    return this.usersService.find(dto);
  }

  @Delete('/:id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }

  @Patch('/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return this.usersService.update(id, body);
  }

  @Post('/login')
  login(@Body() body: CreateUserDto){
    return this.authService.signin(body.email,body.password)
  }

  @Post('/register')
  register(@Body() body: CreateUserDto){
    return this.authService.signup(body.email,body.password)
  }

}
