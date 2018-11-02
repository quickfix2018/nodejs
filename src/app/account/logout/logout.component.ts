import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { AuthService } from '../../auth'
import { DiagnosticService, ApplicationState } from '../../_shared'
import { ToastsManager } from 'ng2-toastr/src/toast-manager'
import { AllRoutes } from '../../app.routes'

@Component({
    moduleId: module.id,
    templateUrl: 'logout.component.html',
    selector: 'logout-component',
})
export class LogoutComponent implements OnInit {
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,
        public appState: ApplicationState,
        private toastsManager: ToastsManager
    ) { }
    ngOnInit() {
        this.authService
            .logout()
            .subscribe(_ => {});
        // this.authService
        //     .logout()
        //     .subscribe(_ => {
        //         if (this.authService.redirectUrl || this.authService.redirectUrl === this.appState.CurrentRouteData.url) {
        //             this.router.navigate(['/'])
        //         }

        //         this.router.navigate([this.authService.redirectUrl])
        //     },
        //     error => this.toastsManager.error('Error while logging out, please try again.'))
    }
}
