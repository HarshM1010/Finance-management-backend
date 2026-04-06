import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post('create-category')
  create(@Body() dto: CreateCategoryDto, @Request() req) {
    return this.categoryService.createCategory(dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch('update-category/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Request() req,
  ) {
    return this.categoryService.updateCategory(id, dto, req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete('delete-category/:id')
  delete(@Param('id') id: string) {
    return this.categoryService.deleteCategory(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get-all-categories')
  findAll() {
    return this.categoryService.findAllCategories();
  }
}
