import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import {
  CreateRecordDto,
  FilterRecordDto,
  UpdateRecordDto,
} from './dto/records.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller('records')
export class RecordsController {
  constructor(private recordsService: RecordsService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('create-record')
  createRecord(@Body() dto: CreateRecordDto, @Request() req) {
    return this.recordsService.createRecord(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ANALYST')
  @Get('filter-records')
  filterRecords(@Query() filters: FilterRecordDto) {
    return this.recordsService.filterRecords(filters);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('update-record/:id')
  updateRecord(@Param('id') id: string, @Body() dto: UpdateRecordDto) {
    return this.recordsService.updateRecord(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('delete-record/:id')
  deleteRecord(@Param('id') id: string) {
    return this.recordsService.deleteRecord(id);
  }
}
