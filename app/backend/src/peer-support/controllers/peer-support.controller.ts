import { Response } from 'express';
import { AuthenticatedRequest } from '../../common/types/auth.types';
import { PeerSupportService } from '../services/peer-support.service';
import { createPeerRequestSchema } from '../dto/create-peer-request.dto';
import { updatePeerRequestSchema } from '../dto/update-peer-request.dto';

const peerSupportService = new PeerSupportService();

export class PeerSupportController {
  async getPeers(_req: AuthenticatedRequest, res: Response) {
    const peers = await peerSupportService.getAvailablePeers();
    return res.status(200).json(peers);
  }

  async createRequest(req: AuthenticatedRequest, res: Response) {
    const dto = createPeerRequestSchema.parse(req.body);
    const result = await peerSupportService.createRequest(req.user!.sub, dto);
    return res.status(201).json(result);
  }

  async getSent(req: AuthenticatedRequest, res: Response) {
    const result = await peerSupportService.getSentRequests(req.user!.sub);
    return res.status(200).json(result);
  }

  async getReceived(req: AuthenticatedRequest, res: Response) {
    const result = await peerSupportService.getReceivedRequests(req.user!.sub);
    return res.status(200).json(result);
  }

  async updateRequest(req: AuthenticatedRequest, res: Response) {
    const dto = updatePeerRequestSchema.parse(req.body);
    const result = await peerSupportService.updateRequest(
      req.user!.sub,
      req.params.id as string,
      dto
    );
    return res.status(200).json(result);
  }
}