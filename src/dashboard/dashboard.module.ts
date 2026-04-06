import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { FilterService } from 'src/common/services/filter.service';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  providers: [DashboardService, FilterService, PrismaService],
  controllers: [DashboardController],
})
export class DashboardModule {}
