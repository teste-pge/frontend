import { RideStatusPipe } from './ride-status.pipe';

describe('RideStatusPipe', () => {
    const pipe = new RideStatusPipe();

    it('should transform PENDING to Aguardando motorista', () => {
        expect(pipe.transform('PENDING')).toBe('Aguardando motorista');
    });

    it('should transform ACCEPTED to Aceita', () => {
        expect(pipe.transform('ACCEPTED')).toBe('Aceita');
    });

    it('should transform REJECTED to Rejeitada', () => {
        expect(pipe.transform('REJECTED')).toBe('Rejeitada');
    });

    it('should transform CANCELLED to Cancelada', () => {
        expect(pipe.transform('CANCELLED')).toBe('Cancelada');
    });

    it('should transform COMPLETED to Concluída', () => {
        expect(pipe.transform('COMPLETED')).toBe('Concluída');
    });

    it('should return the value itself for unknown status', () => {
        expect(pipe.transform('UNKNOWN' as any)).toBe('UNKNOWN');
    });
});
