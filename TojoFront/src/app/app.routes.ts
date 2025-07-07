import { Routes } from '@angular/router';
import { AuthComponent } from './layouts/auth/auth.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { RegisterFormComponent } from './components/register-form/register-form.component';
import { HomeComponent } from './layouts/home/home.component';
import { DashboardUserComponent } from './layouts/dashboard-user/dashboard-user.component';

export const routes: Routes = [
    {
        path: '', component: HomeComponent,
        children: [
            /*{ path: '', component: NavbarAuthComponent }*/
        ]
    },
    {
        path: 'auth', component: AuthComponent,
        children: [
            { path: '', redirectTo: 'login', pathMatch: 'full' },
            { path: 'login', component: LoginFormComponent },
            { path: 'register', component: RegisterFormComponent }
        ]
    },
    {
        path: '', component: DashboardUserComponent,
        children: [
            /*{ path: '', component: HeroComponent }*/
        ]
    }
];
