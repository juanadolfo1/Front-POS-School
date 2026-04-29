export class Gender {
    label: string;
    value: string;

    constructor(label: string, value: string) {
        this.label = label;
        this.value = value;
    }
}

export const GENDERS: Gender[] = [
    new Gender('Masculino', 'M'),
    new Gender('Femenino', 'F'),
];
