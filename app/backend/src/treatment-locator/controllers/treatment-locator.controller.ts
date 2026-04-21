import { Request, Response } from 'express';
import { TreatmentLocatorService } from '../services/treatment-locator.service';
import { createTreatmentProviderSchema } from '../dto/create-treatment-provider.dto';

const treatmentLocatorService = new TreatmentLocatorService();

export class TreatmentLocatorController {
  async create(req: Request, res: Response) {
    const dto = createTreatmentProviderSchema.parse(req.body);
    const provider = await treatmentLocatorService.create(dto);
    return res.status(201).json(provider);
  }

  async getById(req: Request, res: Response) {
    const provider = await treatmentLocatorService.getById(req.params.id as string);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    return res.status(200).json(provider);
  }

  async search(req: Request, res: Response) {
    const hasCrisisSupport =
      req.query.hasCrisisSupport === undefined
        ? undefined
        : req.query.hasCrisisSupport === 'true';

    const results = await treatmentLocatorService.search({
      zipCode: req.query.zipCode as string | undefined,
      insurance: req.query.insurance as string | undefined,
      modality: req.query.modality as string | undefined,
      hasCrisisSupport,
    });

    return res.status(200).json(results);
  }
}