import { Student } from './student.class';

export class Group {
    public id: number;
    public label: string;
    public academic_level?: string;
    public schoolar_year?: string;
    public scholar_year_id?: number;
    public academic_level_id?: number;
    public status: string;

    public students: Student[];
}
