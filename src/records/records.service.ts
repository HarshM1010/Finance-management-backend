import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecordDto } from './dto/records.dto';
import { UpdateRecordDto } from './dto/records.dto';
import { FilterRecordDto } from './dto/records.dto';
import { FilterService } from 'src/common/services/filter.service';

@Injectable()
export class RecordsService {
  constructor(
    private prisma: PrismaService,
    private filterService: FilterService,
  ) {}

  async createRecord(dto: CreateRecordDto, adminId: string) {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category || !category.isActive) {
      throw new BadRequestException('Invalid category');
    }

    return this.prisma.financialRecord.create({
      data: {
        amount: dto.amount,
        type: dto.type,
        categoryId: dto.categoryId,
        notes: dto.notes,
        date: dto.date ? new Date(dto.date) : new Date(),
        createdById: adminId,
      },
    });
  }

  async filterRecords(filters: FilterRecordDto) {
    const where = await this.filterService.buildWhere(filters);
    return this.prisma.financialRecord.findMany({
      where,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateRecord(id: string, dto: UpdateRecordDto) {
    const record = await this.prisma.financialRecord.findUnique({
      where: { id },
    });

    if (!record || record.isDeleted) {
      throw new NotFoundException('Record not found');
    }

    return this.prisma.financialRecord.update({
      where: { id },
      data: {
        ...dto,
      },
    });
  }

  async deleteRecord(id: string) {
    const record = await this.prisma.financialRecord.findUnique({
      where: { id },
    });

    if (!record || record.isDeleted) {
      throw new NotFoundException('Record not found');
    }

    return this.prisma.financialRecord.update({
      where: { id },
      data: { isDeleted: true },
    });
  }
}
