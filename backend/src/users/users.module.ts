import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AdminController } from '../admin/admin.controller';

@Module({
  providers: [UsersService],
  controllers: [UsersController, AdminController],
  exports: [UsersService],
})
export class UsersModule {}
