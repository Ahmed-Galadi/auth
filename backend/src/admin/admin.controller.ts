import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  async listUsers() {
    return this.usersService.listUsers();
  }

  @Post('users')
  async createUser(@Body() dto: RegisterDto) {
    return this.usersService.createUser(dto);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    const userId = Number(id);
    if (req.user?.userId === userId) {
      throw new ForbiddenException('Cannot delete your own account');
    }
    await this.usersService.deleteUser(userId);
    return { success: true };
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto, @Req() req: any) {
    const userId = Number(id);
    if (req.user?.userId === userId && dto.role && dto.role !== req.user.role) {
      throw new ForbiddenException('Cannot change your own role');
    }
    return this.usersService.updateUser(userId, dto);
  }
}
