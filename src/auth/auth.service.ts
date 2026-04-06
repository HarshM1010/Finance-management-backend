import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.isDeleted) {
      throw new UnauthorizedException('Account deleted');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Account inactive');
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      role: user.role,
      status: user.status,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
