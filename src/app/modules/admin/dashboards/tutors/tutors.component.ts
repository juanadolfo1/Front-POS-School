import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TutorsService, Tutor } from './tutors.service';

@Component({
    selector: 'app-tutors',
    templateUrl: './tutors.component.html',
    styleUrl: './tutors.component.scss',
})
export class TutorsComponent implements OnInit {
    tutors: Tutor[] = [];
    isLoading = false;
    searchName = new FormControl<string>('');

    constructor(
        private _tutorsService: TutorsService,
        private _toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.loadTutors();
    }

    loadTutors(): void {
        this.isLoading = true;
        this._tutorsService.getAll().subscribe({
            next: ({ data }) => {
                this.tutors = Array.isArray(data) ? data : [];
                this.isLoading = false;
            },
            error: () => {
                this._toastr.error('Error al cargar tutores');
                this.tutors = [];
                this.isLoading = false;
            },
        });
    }

    get filteredTutors(): Tutor[] {
        const search = (this.searchName.value || '').toLowerCase();
        if (!search) return this.tutors;
        return this.tutors.filter(t =>
            `${t.name} ${t.first_lastname} ${t.second_lastname}`.toLowerCase().includes(search)
        );
    }

    openModal(tutor?: Tutor): void {
        this._tutorsService.openModal(tutor);
    }

    delete(tutor: Tutor): void {
        if (!confirm('¿Eliminar este tutor?')) return;
        this._tutorsService.delete(tutor.id).subscribe({
            next: () => {
                this._toastr.success('Tutor eliminado');
                this.loadTutors();
            },
            error: () => this._toastr.error('Error al eliminar'),
        });
    }
}
