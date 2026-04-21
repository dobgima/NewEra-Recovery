export type PeerConnection = {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'available' | 'away';
};
