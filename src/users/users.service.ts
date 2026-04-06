import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/user.dto';
import { UpdateUserStatusDto } from './dto/user.dto';
import { UpdateUserRoleDto } from './dto/user.dto';
import { Status, Role } from '../../prisma/generated/prisma/enums';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(dto: CreateUserDto, adminId: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hash,
        role: dto.role,
        createdById: adminId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async updateUserStatus(
    userId: string,
    dto: UpdateUserStatusDto,
    adminId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (userId === adminId) {
      throw new BadRequestException('Admin cannot modify themselves');
    }

    if (user.isDeleted) {
      throw new BadRequestException('Cannot change status of an deleted user');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { status: dto.status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async updateUserRole(
    userId: string,
    dto: UpdateUserRoleDto,
    adminId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (userId === adminId) {
      throw new BadRequestException('Admin cannot modify themselves');
    }

    //we will also check if the user is deleted or not, if deleted we will not allow role change
    if (user.isDeleted) {
      throw new BadRequestException('Cannot change role of an deleted user');
    }

    if (user.status === 'INACTIVE') {
      throw new BadRequestException('Cannot change role of an inactive user');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async deleteUser(userId: string, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isDeleted) {
      throw new BadRequestException('User already deleted');
    }

    if (userId === adminId) {
      throw new BadRequestException('Admin cannot modify themselves');
    }

    //we will soft delete the user by setting isDeleted to true
    return this.prisma.user.update({
      where: { id: userId },
      data: { isDeleted: true, status: Status.INACTIVE },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        isDeleted: true,
      },
    });
  }

  //added pagination to findAllUsers who are not deleted, we will also exclude the password field from the response
  async findAllUsers(page = 1, limit = 10) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(limit, 50);
    const skip = (safePage - 1) * safeLimit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { isDeleted: false },
        skip,
        take: safeLimit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: { isDeleted: false },
      }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
        hasNextPage: safePage < Math.ceil(total / safeLimit),
        hasPrevPage: safePage > 1,
      },
    };
  }

  async findViewers(page = 1, limit = 10) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(limit, 50);
    const skip = (safePage - 1) * safeLimit;

    const [viewers, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: Role.VIEWER, isDeleted: false },
        skip,
        take: safeLimit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: { role: Role.VIEWER, isDeleted: false },
      }),
    ]);

    return {
      data: viewers,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
        hasNextPage: safePage < Math.ceil(total / safeLimit),
        hasPrevPage: safePage > 1,
      },
    };
  }

  async findAnalysts(page = 1, limit = 10) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(limit, 50);
    const skip = (safePage - 1) * safeLimit;

    const [analysts, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: Role.ANALYST, isDeleted: false },
        skip,
        take: safeLimit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: { role: Role.ANALYST, isDeleted: false },
      }),
    ]);

    return {
      data: analysts,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
        hasNextPage: safePage < Math.ceil(total / safeLimit),
        hasPrevPage: safePage > 1,
      },
    };
  }

  async findAdmins(page = 1, limit = 10) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(limit, 50);
    const skip = (safePage - 1) * safeLimit;

    const [admins, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { role: Role.ADMIN, isDeleted: false },
        skip,
        take: safeLimit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: { role: Role.ADMIN, isDeleted: false },
      }),
    ]);

    return {
      data: admins,
      meta: {
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
        hasNextPage: safePage < Math.ceil(total / safeLimit),
        hasPrevPage: safePage > 1,
      },
    };
  }
}
