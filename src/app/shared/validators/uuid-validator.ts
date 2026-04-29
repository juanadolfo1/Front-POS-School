import {AbstractControl, ValidationErrors, ValidatorFn} from "@angular/forms";

export function validUuid(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const regex = new RegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$');

        const value = control.value;

        if (value === null || value === undefined || value === '') {
            return null;
        }
        const isValid = regex.test(value);
        console.log(isValid);
        return isValid ? null : { invalidUuid: { value: value } };
    }
}
