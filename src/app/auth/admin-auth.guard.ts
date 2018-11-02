import { Injectable, Inject, forwardRef } from '@angular/core'
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { AuthService } from '../auth'
import { DiagnosticService, ApplicationState } from '../_shared'

@Injectable()
export class AdminAuthGuard implements CanActivate {
    constructor(
        @Inject(forwardRef(() => Router)) private router: Router,
        @Inject(forwardRef(() => AuthService)) private authService: AuthService,
        @Inject(forwardRef(() => DiagnosticService)) private diag: DiagnosticService,
        @Inject(forwardRef(() => ApplicationState)) private appState: ApplicationState
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.authService.isLoggedIn() && this.appState.CurrentUser.IsAdmin) {
            return true
        }

        this.diag.logVerbose(`Not authorized to access route '${route.url}'.`, `${AdminAuthGuard.name}.canActivate()`)
        this.authService.redirectUrl = state.url
        this.router.navigate(['/not-authorized'])
        return false
    }
}