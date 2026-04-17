import { Address, AddressForm } from './address.model';

export type RideStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';

export interface Ride {
  id: string;
  userId: string;
  driverId?: string;
  origin: Address;
  destination: Address;
  status: RideStatus;
  createdAt: string;
  updatedAt: string;
  acceptedAt?: string;
}

export interface CreateRideRequest {
  userId: string;
  origin: AddressForm;
  destination: AddressForm;
}
