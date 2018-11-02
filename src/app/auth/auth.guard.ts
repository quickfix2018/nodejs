import { Injectable, Inject, forwardRef } from '@angular/core'
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { AuthService } from '../auth'
import { DiagnosticService } from '../_shared'

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        @Inject(forwardRef(() => Router)) private router: Router,
        @Inject(forwardRef(() => AuthService)) private authService: AuthService,
        @Inject(forwardRef(() => DiagnosticService)) private diag: DiagnosticService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.authService.isLoggedIn()) {
            return true
        }

        this.diag.logVerbose(`Not authorized to access route '${route.url}'.`, `${AuthGuard.name}.canActivate()`)
        this.authService.redirectUrl = state.url
        this.router.navigate(['/login'])
        return false
    }
}