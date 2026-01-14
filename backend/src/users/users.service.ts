import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { UpdateUserDto } from '../admin/dto/update-user.dto';

interface CreateUserParams {
  name: string;
  email: string;
  password?: string;
  role?: Role;
  googleId?: string | null;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async listUsers() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { id: 'asc' },
    });
  }

  async createUser({ name, email, password, role = Role.USER, googleId = null }: CreateUserParams) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const hashed = password ? await bcrypt.hash(password, 10) : null;
    return this.prisma.user.create({
      data: { name, email, password: hashed, role, googleId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByIdWithSecrets(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true,
        hashedRefreshToken: true,
        googleId: true,
      },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async deleteUser(id: number) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  async updateUser(id: number, dto: UpdateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('User not found');
    }

    if (dto.email && dto.email !== existing.email) {
      const emailTaken = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (emailTaken) {
        throw new ConflictException('Email is already registered');
      }
    }

    const hashed = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name ?? existing.name,
        email: dto.email ?? existing.email,
        role: dto.role ?? existing.role,
        password: hashed ?? existing.password,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    return updated;
  }

  async setHashedRefreshToken(userId: number, hashedRefreshToken: string | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken },
      select: { id: true },
    });
  }
}
