import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';

// Roles permitidos por cada sección
export type AllowedRoles = Array<'usuario' | 'empleado' | 'encargado'>;

function hasValidToken(): boolean {
    try {
        return !!localStorage.getItem('access_token');
    } catch {
        return false;
    }
}

function getRole(): string | null {
    try {
        return localStorage.getItem('user_role');
    } catch {
        return null;
    }
}

export const authRoleGuard: CanActivateFn = (route) => {
    const router = inject(Router);

    // 1) Requiere token
    if (!hasValidToken()) {
        return router.parseUrl('/auth/login');
    }

    // 2) Verificar rol si data.roles está definido
    const roles = (route.data?.['roles'] as AllowedRoles | undefined);
    if (!roles || roles.length === 0) {
        return true; // si no se especifican roles, solo requiere estar autenticado
    }

    const current = getRole();
    if (current && roles.includes(current as any)) {
        return true;
    }

    // Redirigir según rol actual si existe; si no, a warning
    if (current === 'empleado') return router.parseUrl('/tasks');
    if (current === 'encargado') return router.parseUrl('/feed');
    if (current === 'usuario') return router.parseUrl('/home');
    return router.parseUrl('/warning');
};
