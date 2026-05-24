import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TableModule } from 'primeng/table';
import { SpinnerModule } from 'app/layout/common/spinner/spinner.module';
import { PermissionsModule } from 'app/core/permissions/permissions.module';
import { UsersComponent } from './users.component';
import { usersRoutes } from './users.routing';

@NgModule({
    declarations: [UsersComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(usersRoutes),
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        TableModule,
        SpinnerModule,
        PermissionsModule,
    ],
})
export class UsersModule {}
