import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class trendsFilterDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  categoryIds?: string[];
}
