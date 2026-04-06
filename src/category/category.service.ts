import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async createCategory(createCategoryDto: CreateCategoryDto, adminId: string) {
    const existing = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name.toUpperCase() },
    });

    if (existing) {
      throw new BadRequestException('Category already exists');
    }

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name.toUpperCase(),
        description: createCategoryDto.description,
        createdById: adminId,
      },
    });
  }

  async updateCategory(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
    adminId: string,
  ) {
    const existing = await this.prisma.category.findFirst({
      where: { name: updateCategoryDto.name?.toUpperCase(), NOT: { id } },
    });

    if (existing) {
      throw new BadRequestException('Category name already exists');
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: updateCategoryDto.name?.toUpperCase(),
        description: updateCategoryDto.description,
        isActive: updateCategoryDto.isActive,
        createdById: adminId,
      },
    });
  }

  async deleteCategory(id: string) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new BadRequestException('Category not found');
    }

    //we will soft delete the category by setting isActive to false
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false, isDeleted: true },
    });
  }

  async findAllCategories() {
    return this.prisma.category.findMany({
      where: { isDeleted: false },
    });
  }
}
