import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UsersService, AppUser, Role } from './users.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
    users: AppUser[] = [];
    roles: Role[] = [];
    isLoading = false;
    showModal = false;
    isEditing = false;
    rows = 10;
    totalRows = 0;
    first = 0;

    form = new FormGroup({
        id: new FormControl<number>(null),
        name: new FormControl<string>('', Validators.required),
        email: new FormControl<string>('', [Validators.required, Validators.email]),
        password: new FormControl<string>(''),
        role_id: new FormControl<number>(null, Validators.required),
    });

    constructor(
        private _usersService: UsersService,
        private _toastr: ToastrService
    ) {}

    ngOnInit(): void {
        this.loadUsers();
        this._usersService.getRoles().subscribe({
            next: ({ data }) => (this.roles = Array.isArray(data) ? data : []),
            error: () => this._toastr.error('Error al cargar roles'),
        });
    }

    loadUsers(event?: any): void {
        this.isLoading = true;
        if (event?.rows) this.rows = event.rows;
        this.first = event?.first ?? 0;
        const page = Math.ceil(this.first / this.rows) + 1;

        this._usersService.getAll(this.rows, page).subscribe({
            next: ({ data }) => {
                this.users = Array.isArray(data?.data) ? data.data : [];
                this.totalRows = data?.total ?? 0;
                this.isLoading = false;
            },
            error: () => {
                this._toastr.error('Error al cargar usuarios');
                this.users = [];
                this.isLoading = false;
            },
        });
    }

    openModal(user?: AppUser): void {
        this.isEditing = !!user;
        if (user) {
            this.form.patchValue({ id: user.id, name: user.name, email: user.email, role_id: user.role_id, password: '' });
        } else {
            this.form.reset();
        }
        this.showModal = true;
    }

    save(): void {
        if (this.form.invalid) {
            this._toastr.warning('Completa los campos requeridos');
            return;
        }
        const payload = { ...this.form.value } as AppUser;
        if (!payload.password) delete payload.password;

        this._usersService.save(payload).subscribe({
            next: () => {
                this._toastr.success(this.isEditing ? 'Usuario actualizado' : 'Usuario creado');
                this.showModal = false;
                this.loadUsers();
            },
            error: () => this._toastr.error('Error al guardar'),
        });
    }

    delete(user: AppUser): void {
        if (!confirm('¿Eliminar este usuario?')) return;
        this._usersService.delete(user.id).subscribe({
            next: () => {
                this._toastr.success('Usuario eliminado');
                this.loadUsers();
            },
            error: () => this._toastr.error('Error al eliminar'),
        });
    }
}
