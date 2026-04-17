import { RideStatusPipe } from './ride-status.pipe';

describe('RideStatusPipe', () => {
    const pipe = new RideStatusPipe();

    it('should transform PENDING to Aguardando motorista', () => {
        expect(pipe.transform('PENDING')).toBe('Aguardando motorista');
    });

    it('should transform ACCEPTED to Aceita', () => {
        expect(pipe.transform('ACCEPTED')).toBe('Aceita');
    });
});
