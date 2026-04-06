import { Module } from '@nestjs/common';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { PrismaService } from 'prisma/prisma.service';
import { FilterService } from 'src/common/services/filter.service';

@Module({
  providers: [RecordsService, PrismaService, FilterService],
  controllers: [RecordsController],
})
export class RecordsModule {}
