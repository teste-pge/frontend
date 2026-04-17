export type DriverStatus = 'AVAILABLE' | 'BUSY';

export interface Driver {
  id: string;
  name: string;
  vehiclePlate: string;
  status: DriverStatus;
}
