import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
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
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatSelectModule,
        SpinnerModule,
        PermissionsModule,
    ],
})
export class CatalogsModule {}
