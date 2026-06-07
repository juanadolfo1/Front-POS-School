import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { SpinnerModule } from 'app/layout/common/spinner/spinner.module';
import { PermissionsModule } from 'app/core/permissions/permissions.module';
import { CatalogsComponent } from './catalogs.component';
import { catalogsRoutes } from './catalogs.routing';

@NgModule({
    declarations: [CatalogsComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(catalogsRoutes),
        ReactiveFormsModule,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        SpinnerModule,
        PermissionsModule,
    ],
})
export class CatalogsModule {}
