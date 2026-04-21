import { prisma } from '../../common/db/prisma';
import { CreateDailyFeedItemDto } from '../dto/create-daily-feed-item.dto';
import { AppError } from '../../common/errors/app-error';
import { cacheService, CacheService } from '../../common/cache/cache.service';

export class DailyFeedService {
  async create(dto: CreateDailyFeedItemDto) {
    const item = await prisma.dailyFeedItem.create({
      data: {
        title: dto.title.trim(),
        body: dto.body.trim(),
        category: dto.category.trim(),
        dayKey: dto.dayKey?.trim(),
        isActive: dto.isActive ?? true,
      },
    });

    // Invalidate cache when new items are created
    await cacheService.deletePattern('daily_feed:*');

    return item;
  }

  async getAll() {
    return prisma.dailyFeedItem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getToday() {
    const todayKey = this.getTodayKey();
    const cacheKey = CacheService.dailyFeedKey(todayKey);

    // Try to get from cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const exactMatch = await prisma.dailyFeedItem.findFirst({
      where: {
        isActive: true,
        dayKey: todayKey,
      },
    });

    if (exactMatch) {
      const result = {
        source: 'dayKey',
        item: exactMatch,
      };

      // Cache for 24 hours (86400 seconds)
      await cacheService.set(cacheKey, result, 86400);
      return result;
    }

    const fallbackItems = await prisma.dailyFeedItem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'asc' },
    });

    if (!fallbackItems.length) {
      throw new AppError('No active daily feed items found', 404);
    }

    const dayIndex = this.getDayIndex() % fallbackItems.length;
    const selected = fallbackItems[dayIndex];

    const result = {
      source: 'rotation',
      item: selected,
    };

    // Cache for 24 hours
    await cacheService.set(cacheKey, result, 86400);
    return result;
  }

  private getTodayKey() {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  }

  private getDayIndex() {
    const now = new Date();
    const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 0));
    const diff = now.getTime() - yearStart.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}