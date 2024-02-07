import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUserDto } from './dto/find-user.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me/wishes')
  findCurrentUsersWishes(@Request() req) {
    return this.usersService.findUsersWishesByUsername(req.user.username);
  }

  @Get('/me')
  findCurrentUser(@Request() req) {
    return this.usersService.findCurrentUser(req.user);
  }

  @Patch('/me')
  findAndUpdateCurrentUser(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.findAndUpdateCurrentUser(req.user, updateUserDto);
  }

  @Get(':username')
  findUserByUsername(@Param('username') username: string) {
    return this.usersService.findUserByUsername(username);
  }

  @Get(':username/wishes')
  findUsersWishesByUsername(@Param('username') username: string) {
    return this.usersService.findUsersWishesByUsername(username);
  }

  @Post('/find')
  create(@Body() findUserDto: FindUserDto) {
    return this.usersService.findUserByQuery(findUserDto);
  }
}
