import { FormGroup, FormControl } from '@angular/forms';
import { differentAddressesValidator } from './different-addresses.validator';

describe('differentAddressesValidator', () => {
    it('should fail when same cep+numero', () => {
        const form = new FormGroup(
            {
                origin: new FormGroup({
                    cep: new FormControl('01310-100'),
                    numero: new FormControl('1000'),
                }),
                destination: new FormGroup({
                    cep: new FormControl('01310-100'),
                    numero: new FormControl('1000'),
                }),
            },
            { validators: differentAddressesValidator() }
        );

        expect(form.hasError('sameAddress')).toBe(true);
    });

    it('should pass when different cep or numero', () => {
        const form = new FormGroup(
            {
                origin: new FormGroup({
                    cep: new FormControl('01310-100'),
                    numero: new FormControl('1000'),
                }),
                destination: new FormGroup({
                    cep: new FormControl('04538-132'),
                    numero: new FormControl('2000'),
                }),
            },
            { validators: differentAddressesValidator() }
        );

        expect(form.hasError('sameAddress')).toBe(false);
    });
});
