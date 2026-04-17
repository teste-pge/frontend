import { AbstractControl, ValidatorFn } from '@angular/forms';

const CEP_REGEX = /^\d{5}-\d{3}$/;

export function cepFormatValidator(): ValidatorFn {
    return (control: AbstractControl) => {
        if (!control.value) return null;
        return CEP_REGEX.test(control.value) ? null : { cepFormat: { value: control.value } };
    };
}
