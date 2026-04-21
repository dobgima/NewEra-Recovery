import { PeerRequestStatus, UserRole } from '@prisma/client';
import { prisma } from '../../common/db/prisma';
import { AppError } from '../../common/errors/app-error';
import { CreatePeerRequestDto } from '../dto/create-peer-request.dto';
import { UpdatePeerRequestDto } from '../dto/update-peer-request.dto';

export class PeerSupportService {
  async getAvailablePeers() {
    return prisma.user.findMany({
      where: {
        role: UserRole.PEER,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            displayName: true,
            zipCode: true,
            avatarUrl: true,
          },
        },
        preferences: {
          select: {
            primaryModality: true,
            secondaryModality: true,
            wantsPeerSupport: true,
            timezone: true,
          },
        },
      },
      take: 100,
    });
  }

  async createRequest(requesterId: string, dto: CreatePeerRequestDto) {
    if (requesterId === dto.recipientId) {
      throw new AppError('You cannot request peer support from yourself', 400);
    }

    const recipient = await prisma.user.findUnique({
      where: { id: dto.recipientId },
      include: {
        profile: true,
        preferences: true,
      },
    });

    if (!recipient || !recipient.isActive) {
      throw new AppError('Peer not found', 404);
    }

    if (recipient.role !== UserRole.PEER) {
      throw new AppError('Selected user is not available as a peer', 400);
    }

    if (!recipient.preferences?.wantsPeerSupport) {
      throw new AppError('This peer is not accepting peer support requests', 400);
    }

    const existingPending = await prisma.peerSupportRequest.findFirst({
      where: {
        requesterId,
        recipientId: dto.recipientId,
        status: PeerRequestStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new AppError('A pending peer support request already exists', 409);
    }

    return prisma.peerSupportRequest.create({
      data: {
        requesterId,
        recipientId: dto.recipientId,
        message: dto.message?.trim(),
        status: PeerRequestStatus.PENDING,
      },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        recipient: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
    });
  }

  async getSentRequests(userId: string) {
    return prisma.peerSupportRequest.findMany({
      where: { requesterId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        recipient: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
      take: 100,
    });
  }

  async getReceivedRequests(userId: string) {
    return prisma.peerSupportRequest.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
      take: 100,
    });
  }

  async updateRequest(currentUserId: string, requestId: string, dto: UpdatePeerRequestDto) {
    const request = await prisma.peerSupportRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new AppError('Peer support request not found', 404);
    }

    // Recipient can accept/decline. Requester can cancel.
    const isRecipient = request.recipientId === currentUserId;
    const isRequester = request.requesterId === currentUserId;

    if (!isRecipient && !isRequester) {
      throw new AppError('Forbidden', 403);
    }

    if (dto.status === 'CANCELLED' && !isRequester) {
      throw new AppError('Only the requester can cancel a request', 403);
    }

    if ((dto.status === 'ACCEPTED' || dto.status === 'DECLINED') && !isRecipient) {
      throw new AppError('Only the recipient can accept or decline a request', 403);
    }

    if (request.status !== PeerRequestStatus.PENDING) {
      throw new AppError('Only pending requests can be updated', 400);
    }

    return prisma.peerSupportRequest.update({
      where: { id: requestId },
      data: {
        status: dto.status,
      },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        recipient: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
    });
  }
}