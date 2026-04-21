import { Request, Response } from 'express';
import { ResourcesService } from '../services/resources.service';
import { createResourceSchema } from '../dto/create-resource.dto';

const resourcesService = new ResourcesService();

export class ResourcesController {
  async create(req: Request, res: Response) {
    const dto = createResourceSchema.parse(req.body);
    const resource = await resourcesService.create(dto);
    return res.status(201).json(resource);
  }

  async getAll(_req: Request, res: Response) {
    const resources = await resourcesService.getAll();
    return res.status(200).json(resources);
  }

  async getFeatured(_req: Request, res: Response) {
    const resources = await resourcesService.getFeatured();
    return res.status(200).json(resources);
  }

  async getByTag(req: Request, res: Response) {
    const tag = Array.isArray(req.params.tag) ? req.params.tag[0] : req.params.tag;
    const resources = await resourcesService.getByTag(tag);
    return res.status(200).json(resources);
  }
}