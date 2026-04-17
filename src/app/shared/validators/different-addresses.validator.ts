import { AbstractControl, ValidatorFn } from '@angular/forms';

/**
 * Cross-field validator: origin and destination must differ by cep+numero.
 * Apply to the parent FormGroup containing 'origin' and 'destination' FormGroups.
 */
export function differentAddressesValidator(): ValidatorFn {
    return (control: AbstractControl) => {
        const origin = control.get('origin');
        const destination = control.get('destination');

        if (!origin || !destination) return null;

        const originCep = origin.get('cep')?.value;
        const originNumero = origin.get('numero')?.value;
        const destCep = destination.get('cep')?.value;
        const destNumero = destination.get('numero')?.value;

        if (!originCep || !originNumero || !destCep || !destNumero) return null;

        const same = originCep === destCep && originNumero === destNumero;
        return same ? { sameAddress: true } : null;
    };
}
