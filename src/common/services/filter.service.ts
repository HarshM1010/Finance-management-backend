//commmon service to build where clause for record filtering, used by both RecordsService and DashboardServiceimport { Injectable } from '@nestjs/common';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FilterRecordDto } from '../../records/dto/records.dto';

@Injectable()
export class FilterService {
  constructor(private prisma: PrismaService) {}

  async buildWhere(filters: FilterRecordDto) {
    const where: any = {
      isDeleted: false,
    };

    if (filters.type) {
      where.type = filters.type;
      console.log('Filtering by type:', filters.type);
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      const categories = await this.prisma.category.findMany({
        where: {
          id: { in: filters.categoryIds },
          isActive: true,
        },
      });

      if (categories.length !== filters.categoryIds.length) {
        throw new BadRequestException('Invalid or inactive categories');
      }

      where.categoryId = { in: filters.categoryIds };
    }

    if (filters.amountLow !== undefined || filters.amountHigh !== undefined) {
      where.amount = {};

      if (filters.amountLow !== undefined) {
        where.amount.gte = filters.amountLow;
      }

      if (filters.amountHigh !== undefined) {
        where.amount.lte = filters.amountHigh;
      }
    }

    if (filters.startDate || filters.endDate) {
      where.date = {};

      if (filters.startDate) {
        where.date.gte = filters.startDate;
      }

      if (filters.endDate) {
        where.date.lte = filters.endDate;
      }
    }

    return where;
  }
}
