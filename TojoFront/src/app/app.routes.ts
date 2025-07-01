import { Routes } from '@angular/router';
import { HomeComponent } from './layouts/home/home.component';
import { HeroComponent } from './components/hero/hero.component';
import { CategoriesComponent } from './components/categories/categories.component';

export const routes: Routes = [
    {
        path: '', component: HomeComponent,
        /*children: [
            { path: '', component: HeroComponent },
            { path: '', component: CategoriesComponent }
        ]*/
    }
];
