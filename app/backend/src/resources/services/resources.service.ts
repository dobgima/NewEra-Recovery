import { prisma } from '../../common/db/prisma';
import { CreateResourceDto } from '../dto/create-resource.dto';

export class ResourcesService {
  async create(dto: CreateResourceDto) {
    const resource = await prisma.resource.create({
      data: {
        title: dto.title.trim(),
        description: dto.description?.trim(),
        url: dto.url?.trim(),
        type: dto.type,
        tags: [...new Set(dto.tags.map((t) => t.trim()).filter(Boolean))],
        isFeatured: dto.isFeatured ?? false,
      },
    });

    return resource;
  }

  async getAll() {
    return prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getFeatured() {
    return prisma.resource.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  async getByTag(tag: string) {
    return prisma.resource.findMany({
      where: {
        tags: {
          has: tag,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}