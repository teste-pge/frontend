import { AbstractControl, ValidatorFn } from '@angular/forms';

const BRAZILIAN_STATES = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

export function brazilianStateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
        if (!control.value) return null;
        const upper = control.value.toUpperCase();
        return BRAZILIAN_STATES.includes(upper)
            ? null
            : { brazilianState: { value: control.value } };
    };
}
