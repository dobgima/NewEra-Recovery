import { NextFunction, Response } from 'express';
import { SupportContactsService } from '../services/support-contacts.service';
import { AuthenticatedRequest } from '../../common/middleware/auth.middleware';
import { CreateSupportContactDto, CreateSupportContactDtoSchema, UpdateSupportContactDto, UpdateSupportContactDtoSchema } from '../dto/support-contact.dto';

const supportContactsService = new SupportContactsService();

export const getSupportContactsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const contacts = await supportContactsService.getSupportContacts(req.user.sub);
    return res.status(200).json(contacts);
  } catch (error) {
    return next(error);
  }
};

export const createSupportContactController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const validatedData = CreateSupportContactDtoSchema.parse(req.body);
    const contact = await supportContactsService.createSupportContact(req.user.sub, validatedData);
    return res.status(201).json(contact);
  } catch (error) {
    return next(error);
  }
};

export const updateSupportContactController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const validatedData = UpdateSupportContactDtoSchema.parse(req.body);
    const contact = await supportContactsService.updateSupportContact(req.user.sub, id, validatedData);
    return res.status(200).json(contact);
  } catch (error) {
    return next(error);
  }
};

export const deleteSupportContactController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user?.sub) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await supportContactsService.deleteSupportContact(req.user.sub, id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
};