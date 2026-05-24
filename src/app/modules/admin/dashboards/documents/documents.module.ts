import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PermissionsModule } from 'app/core/permissions/permissions.module';
import { DocumentsComponent } from './documents.component';
import { documentsRoutes } from './documents.routing';

@NgModule({
    declarations: [DocumentsComponent],
    imports: [
        CommonModule,
        RouterModule.forChild(documentsRoutes),
        ReactiveFormsModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        PermissionsModule,
    ],
})
export class DocumentsModule {}
