import { Pipe, PipeTransform } from '@angular/core';
import { RideStatus } from '@core/models';

const STATUS_LABELS: Record<RideStatus, string> = {
    PENDING: 'Aguardando motorista',
    ACCEPTED: 'Aceita',
    REJECTED: 'Rejeitada',
    CANCELLED: 'Cancelada',
    COMPLETED: 'Concluída',
};

@Pipe({
    name: 'rideStatus',
    standalone: true,
})
export class RideStatusPipe implements PipeTransform {
    transform(value: RideStatus): string {
        return STATUS_LABELS[value] ?? value;
    }
}
