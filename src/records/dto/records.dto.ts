import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { RecordType } from '../../../prisma/generated/prisma/enums';
import { Transform, Type } from 'class-transformer';

export class CreateRecordDto {
  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsEnum(RecordType)
  @IsNotEmpty()
  type!: RecordType;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  date?: Date;
}

export class UpdateRecordDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsEnum(RecordType)
  type?: RecordType;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  date?: Date;
}

export class FilterRecordDto {
  @IsOptional()
  @IsEnum(RecordType)
  type?: RecordType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amountLow?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amountHigh?: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  categoryIds?: string[];

  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  endDate?: Date;
}
