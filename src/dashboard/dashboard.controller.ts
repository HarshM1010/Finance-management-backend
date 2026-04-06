import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { FilterRecordDto } from 'src/records/dto/records.dto';
import { trendsFilterDto } from './dto/trends.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VIEWER', 'ANALYST')
  @Get('summary-and-category-stats')
  getSummaryAndCategoryStats(@Query() filters: FilterRecordDto) {
    return this.dashboardService.getSummaryAndCategoryStats(filters);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VIEWER', 'ANALYST')
  @Get('trends-monthly')
  getMonthly(
    @Query() filters: trendsFilterDto,
    @Query('months') months?: string,
  ) {
    return this.dashboardService.getMonthlyTrends(
      filters,
      months ? Number(months) : 6,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('VIEWER', 'ANALYST')
  @Get('trends-weekly')
  getWeekly(@Query() filters: trendsFilterDto, @Query('weeks') weeks?: string) {
    return this.dashboardService.getWeeklyTrends(
      filters,
      weeks ? Number(weeks) : 4,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ANALYST')
  @Get('recent-activity')
  getRecent(@Query() filters: FilterRecordDto, @Query('limit') limit?: string) {
    const safeLimit = Math.min(Number(limit) || 10, 50); //ensure limit is a number and does not exceed 50
    return this.dashboardService.getRecentActivity(filters, safeLimit);
  }
}
