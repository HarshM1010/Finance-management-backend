import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
  Request,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';
import { UpdateUserStatusDto } from './dto/user.dto';
import { UpdateUserRoleDto } from './dto/user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('create-user')
  createUser(@Body() dto: CreateUserDto, @Request() req) {
    return this.usersService.createUser(dto, req.user.id);
  }

  @Patch('update-user-status/:id')
  updateUserStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @Request() req,
  ) {
    return this.usersService.updateUserStatus(id, dto, req.user.id);
  }

  @Patch('update-user-role/:id')
  updateUserRole(
    @Param('id') id: string,
    @Body() dto: UpdateUserRoleDto,
    @Request() req,
  ) {
    return this.usersService.updateUserRole(id, dto, req.user.id);
  }

  @Delete('delete-user/:id')
  deleteUser(@Param('id') id: string, @Request() req) {
    return this.usersService.deleteUser(id, req.user.id);
  }

  @Get('get-all-users')
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.usersService.findAllUsers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('get-viewers')
  findViewers(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.usersService.findViewers(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('get-analysts')
  findAnalysts(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.usersService.findAnalysts(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('get-admins')
  findAdmins(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.usersService.findAdmins(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }
}
