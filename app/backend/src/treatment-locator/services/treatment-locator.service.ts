import { prisma } from '../../common/db/prisma';
import { CreateTreatmentProviderDto } from '../dto/create-treatment-provider.dto';

type SearchParams = {
  zipCode?: string;
  insurance?: string;
  modality?: string;
  hasCrisisSupport?: boolean;
};

export class TreatmentLocatorService {
  async create(dto: CreateTreatmentProviderDto) {
    return prisma.treatmentProvider.create({
      data: {
        name: dto.name.trim(),
        zipCode: dto.zipCode.trim(),
        city: dto.city.trim(),
        state: dto.state.trim(),
        latitude: dto.latitude,
        longitude: dto.longitude,
        insuranceAccepted: [...new Set(dto.insuranceAccepted.map((x) => x.trim()).filter(Boolean))],
        modalities: [...new Set(dto.modalities.map((x) => x.trim()).filter(Boolean))],
        hasCrisisSupport: dto.hasCrisisSupport ?? false,
        phone: dto.phone?.trim(),
        website: dto.website?.trim(),
      },
    });
  }

  async getById(id: string) {
    return prisma.treatmentProvider.findUnique({
      where: { id },
    });
  }

  async search(params: SearchParams) {
    const where: any = {};

    if (params.zipCode) {
      where.zipCode = params.zipCode.trim();
    }

    if (params.insurance) {
      where.insuranceAccepted = {
        has: params.insurance.trim(),
      };
    }

    if (params.modality) {
      where.modalities = {
        has: params.modality.trim(),
      };
    }

    if (typeof params.hasCrisisSupport === 'boolean') {
      where.hasCrisisSupport = params.hasCrisisSupport;
    }

    return prisma.treatmentProvider.findMany({
      where,
      orderBy: [
        { hasCrisisSupport: 'desc' },
        { createdAt: 'desc' },
      ],
      take: 100,
    });
  }
}