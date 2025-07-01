import { Routes } from '@angular/router';
import { HomeComponent } from './layouts/home/home.component';
import { NavbarAuthComponent } from './shared/navbarauth/navbarauth.component';

export const routes: Routes = [
    {
        path: '', component: HomeComponent,
        children: [
            /*{ path: '', component: NavbarAuthComponent }*/
        ]
    },
    {
        path: 'home', component: HomeComponent,
        children: [
            /*{ path: '', component: HeroComponent }*/
        ]
    }
];
