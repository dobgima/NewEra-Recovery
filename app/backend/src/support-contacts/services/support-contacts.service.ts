import { prisma } from '../../common/db/prisma';
import { AppError, ErrorCodes } from '../../common/errors/app-error';
import { CreateSupportContactDto, UpdateSupportContactDto } from '../dto/support-contact.dto';

export class SupportContactsService {
  async getSupportContacts(userId: string) {
    return prisma.supportContact.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createSupportContact(userId: string, dto: CreateSupportContactDto) {
    // If setting as primary, unset other primaries
    if (dto.isPrimary) {
      await prisma.supportContact.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });
    }

    return prisma.supportContact.create({
      data: {
        userId,
        ...dto,
      },
    });
  }

  async updateSupportContact(userId: string, contactId: string, dto: UpdateSupportContactDto) {
    const contact = await prisma.supportContact.findFirst({
      where: {
        id: contactId,
        userId,
        deletedAt: null,
      },
    });

    if (!contact) {
      throw new AppError('Support contact not found', 404, ErrorCodes.NOT_FOUND);
    }

    // If setting as primary, unset other primaries
    if (dto.isPrimary) {
      await prisma.supportContact.updateMany({
        where: { userId },
        data: { isPrimary: false },
      });
    }

    return prisma.supportContact.update({
      where: { id: contactId },
      data: dto,
    });
  }

  async deleteSupportContact(userId: string, contactId: string) {
    const contact = await prisma.supportContact.findFirst({
      where: {
        id: contactId,
        userId,
        deletedAt: null,
      },
    });

    if (!contact) {
      throw new AppError('Support contact not found', 404, ErrorCodes.NOT_FOUND);
    }

    return prisma.supportContact.update({
      where: { id: contactId },
      data: { deletedAt: new Date() },
    });
  }
}