import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { homeRoutes } from './home.routing';

@NgModule({
    declarations: [HomeComponent],
    imports: [RouterModule.forChild(homeRoutes)],
})
export class HomeModule {}
