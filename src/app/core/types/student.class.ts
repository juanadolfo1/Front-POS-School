export class Student {
    public id?: number;
    public status: number;
    public gender: string;
    public birthday: string;
    public curp: string;
    public email: string;
    public name: string;
    public first_lastname: string;
    public second_lastname: string;
    public total: number;
    public student_group_id: number;
    public academic_level_id: number;
    public scholar_year_id: number;
}

export function localeBirthDay(birthday: string): string {
    return birthday.split('-').reverse().join('/');
}

export const genres = {
    M: 'Masculino',
    F: 'Femenino',
};
