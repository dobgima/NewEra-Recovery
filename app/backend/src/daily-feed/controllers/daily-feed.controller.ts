import { Request, Response } from 'express';
import { DailyFeedService } from '../services/daily-feed.service';
import { createDailyFeedItemSchema } from '../dto/create-daily-feed-item.dto';

const dailyFeedService = new DailyFeedService();

export class DailyFeedController {
  async create(req: Request, res: Response) {
    const dto = createDailyFeedItemSchema.parse(req.body);
    const item = await dailyFeedService.create(dto);
    return res.status(201).json(item);
  }

  async getAll(_req: Request, res: Response) {
    const items = await dailyFeedService.getAll();
    return res.status(200).json(items);
  }

  async getToday(_req: Request, res: Response) {
    const result = await dailyFeedService.getToday();
    return res.status(200).json(result);
  }
}