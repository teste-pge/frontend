import {
    Component, ChangeDetectionStrategy, input, inject, signal, OnInit, DestroyRef,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, filter, switchMap, catchError, of } from 'rxjs';

import { CepService } from '@core/services';

@Component({
    selector: 'app-address-form',
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatProgressSpinnerModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './address-form.component.html',
    styleUrl: './address-form.component.scss',
})
export class AddressFormComponent implements OnInit {
    label = input<string>('Endereço');
    controlName = input.required<string>();
    parentForm = input.required<FormGroup>();

    private readonly cepService = inject(CepService);
    private readonly destroyRef = inject(DestroyRef);

    loading = signal(false);
    cepNotFound = signal(false);

    get addressGroup(): FormGroup {
        return this.parentForm().get(this.controlName()) as FormGroup;
    }

    get cepControl(): FormControl {
        return this.addressGroup.get('cep')! as FormControl;
    }

    getControl(name: string): FormControl {
        return this.addressGroup.get(name)! as FormControl;
    }

    ngOnInit(): void {
        this.cepControl.valueChanges.pipe(
            debounceTime(400),
            distinctUntilChanged(),
            filter((value: string) => value.replace(/\D/g, '').length === 8),
            switchMap((value: string) => {
                this.loading.set(true);
                this.cepNotFound.set(false);
                return this.cepService.lookup(value).pipe(
                    catchError(() => {
                        this.loading.set(false);
                        this.cepNotFound.set(true);
                        return of(null);
                    })
                );
            }),
            takeUntilDestroyed(this.destroyRef),
        ).subscribe((address) => {
            this.loading.set(false);
            if (address) {
                this.addressGroup.patchValue({
                    cep: address.cep,
                    logradouro: address.logradouro,
                    bairro: address.bairro,
                    cidade: address.cidade,
                    estado: address.estado,
                    complemento: address.complemento,
                });
            } else {
                this.cepNotFound.set(true);
                this.clearFieldsExceptCep();
            }
        });
    }

    onCepInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        let digits = input.value.replace(/\D/g, '');
        if (digits.length > 8) digits = digits.slice(0, 8);
        if (digits.length > 5) {
            input.value = `${digits.slice(0, 5)}-${digits.slice(5)}`;
        } else {
            input.value = digits;
        }
        this.cepControl.setValue(input.value, { emitEvent: true });
    }

    private clearFieldsExceptCep(): void {
        this.addressGroup.patchValue({
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
        });
    }
}
