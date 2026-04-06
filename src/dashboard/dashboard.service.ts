import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RecordType } from '../../prisma/generated/prisma/enums';
import { FilterRecordDto } from 'src/records/dto/records.dto';
import { FilterService } from 'src/common/services/filter.service';
import { trendsFilterDto } from './dto/trends.dto';

type MonthlyRow = { month: string; type: string; total: number; count: number };
type WeeklyRow = { week: string; type: string; total: number; count: number };

@Injectable()
export class DashboardService {
  constructor(
    private prisma: PrismaService,
    private filterService: FilterService,
  ) {}

  async getSummaryAndCategoryStats(filters: FilterRecordDto) {
    const where = await this.filterService.buildWhere(filters)

    const { type, ...whereWithoutType } = where

    const incomeWhere =
      type && type !== 'INCOME'
        ? null
        : { ...whereWithoutType, type: 'INCOME' };
    const expenseWhere =
      type && type !== 'EXPENSE'
        ? null
        : { ...whereWithoutType, type: 'EXPENSE' };

    const [income, expense, groupedCategories] = await Promise.all([
      incomeWhere
        ? this.prisma.financialRecord.aggregate({ where: incomeWhere, _sum: { amount: true } })
        : Promise.resolve({ _sum: { amount: 0 } }),

      expenseWhere
        ? this.prisma.financialRecord.aggregate({
            where: expenseWhere,
            _sum: { amount: true },
          })
        : Promise.resolve({ _sum: { amount: 0 } }),

      this.prisma.financialRecord.groupBy({
        by: ['categoryId', 'type'],
        where,
        _sum: { amount: true },
      }),
    ]);

    // Build result map
    const resultMap: Record<
      string,
      {
        categoryId: string;
        categoryName: string;
        totalIncome: number;
        totalExpense: number;
        netBalance: number;
      }
    > = {};

    for (const item of groupedCategories) {
      const id = item.categoryId;
      const amount = Number(item._sum.amount ?? 0);

      if (!resultMap[id]) {
        resultMap[id] = {
          categoryId: id,
          categoryName: 'Unknown',
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
        };
      }

      if (item.type === 'INCOME') {
        resultMap[id].totalIncome += amount;
      } else {
        resultMap[id].totalExpense += amount;
      }
    }

    // Fetch all category names in one query — not inside loop
    const categoryIds = Object.keys(resultMap)
    const categoryList = await this.prisma.category.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });
    const categoryMap = Object.fromEntries(
      categoryList.map((c) => [c.id, c.name]),
    );

    // Calculate net balance and attach names
    for (const key in resultMap) {
      resultMap[key].categoryName = categoryMap[key] ?? 'Unknown';
      resultMap[key].netBalance =
        resultMap[key].totalIncome - resultMap[key].totalExpense;
    }

    const totalIncome = Number(income._sum.amount ?? 0);
    const totalExpense = Number(expense._sum.amount ?? 0);

    return {
      summary: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
      },
      categories: Object.values(resultMap),
    };
  }

  //in montly trends we can only filter by category so we can reuse the same filter service.
  async getMonthlyTrends(filters: trendsFilterDto, n = 6) {
    const safeN = Math.min(n, 12);
    const start = new Date();
    start.setMonth(start.getMonth() - safeN);

    // Validate categories exist and are active
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
    }

    // Build query based on whether categoryIds filter exists
    let trends: MonthlyRow[];

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      // Convert array to postgres array string  e.g. ('uuid1','uuid2')
      const categoryPlaceholders = filters.categoryIds
        .map((_, i) => `$${i + 2}`) // $2, $3, $4 ... ($1 is start date)
        .join(', ');

      trends = await this.prisma.$queryRawUnsafe<MonthlyRow[]>(
        `
          SELECT
            TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
            type,
            SUM(amount)::float  AS total,
            COUNT(*)::int       AS count
          FROM "FinancialRecord"
          WHERE "isDeleted" = false
          AND date >= $1
          AND "categoryId" IN (${categoryPlaceholders})
          GROUP BY DATE_TRUNC('month', date), type
          ORDER BY month ASC
        `,
        start,
        ...filters.categoryIds, // spread as positional params $2, $3...
      );
    } else {
      // No category filter
      trends = await this.prisma.$queryRawUnsafe<MonthlyRow[]>(
        `
          SELECT
            TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
            type,
            SUM(amount)::float  AS total,
            COUNT(*)::int       AS count
          FROM "FinancialRecord"
          WHERE "isDeleted" = false
          AND date >= $1
          GROUP BY DATE_TRUNC('month', date), type
          ORDER BY month ASC
        `,
        start,
      );
    }

    const result: Record<string, any> = {};

    for (const row of trends) {
      if (!result[row.month]) {
        result[row.month] = {
          month: row.month,
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
          transactionCount: 0,
        };
      }

      if (row.type === RecordType.INCOME) {
        result[row.month].totalIncome = Number(row.total);
      } else {
        result[row.month].totalExpense = Number(row.total);
      }

      result[row.month].netBalance =
        result[row.month].totalIncome - result[row.month].totalExpense;
      result[row.month].transactionCount += row.count;
    }

    return Object.values(result);
  }

  async getWeeklyTrends(filters: trendsFilterDto, n = 4) {
    const safeN = Math.min(n, 12);
    const start = new Date();
    start.setDate(start.getDate() - safeN * 7);

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      const categories = await this.prisma.category.findMany({
        where: {
          id: { in: filters.categoryIds },
          isActive: true,
        },
      })
      if (categories.length !== filters.categoryIds.length) {
        throw new BadRequestException('Invalid or inactive categories');
      }
    }

    let trends: WeeklyRow[];

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      const categoryPlaceholders = filters.categoryIds
        .map((_, i) => `$${i + 2}`)
        .join(', ');

      trends = await this.prisma.$queryRawUnsafe<WeeklyRow[]>(
        `
          SELECT
            TO_CHAR(DATE_TRUNC('week', date), 'IYYY-"W"IW') AS week,
            type,
            SUM(amount)::float  AS total,
            COUNT(*)::int       AS count
          FROM "FinancialRecord"
          WHERE "isDeleted" = false
          AND date >= $1
          AND "categoryId" IN (${categoryPlaceholders})
          GROUP BY DATE_TRUNC('week', date), type
          ORDER BY week ASC
        `,
        start,
        ...filters.categoryIds,
      );
    } else {
      trends = await this.prisma.$queryRawUnsafe<WeeklyRow[]>(
        `
          SELECT
            TO_CHAR(DATE_TRUNC('week', date), 'IYYY-"W"IW') AS week,
            type,
            SUM(amount)::float  AS total,
            COUNT(*)::int       AS count
          FROM "FinancialRecord"
          WHERE "isDeleted" = false
          AND date >= $1
          GROUP BY DATE_TRUNC('week', date), type
          ORDER BY week ASC
        `,
        start,
      );
    }

    const result: Record<string, any> = {};

    for (const row of trends) {
      if (!result[row.week]) {
        result[row.week] = {
          week: row.week,
          totalIncome: 0,
          totalExpense: 0,
          netBalance: 0,
          transactionCount: 0,
        };
      }

      if (row.type === RecordType.INCOME) {
        result[row.week].totalIncome = Number(row.total);
      } else {
        result[row.week].totalExpense = Number(row.total);
      }

      result[row.week].netBalance =
        result[row.week].totalIncome - result[row.week].totalExpense;
      result[row.week].transactionCount += row.count;
    }

    return Object.values(result);
  }

  async getRecentActivity(filters: FilterRecordDto, limit = 10) {
    const where = await this.filterService.buildWhere(filters);

    return this.prisma.financialRecord.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        category: true,
      },
    });
  }
}
