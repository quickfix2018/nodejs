import { Component, OnInit } from '@angular/core'
import { ApplicationState } from '../../_shared'
import 'rxjs/add/operator/mergeMap'

@Component({
    moduleId: module.id,
    templateUrl: 'login.component.html',
    styleUrls: ['login.component.css'],
    selector: 'login-form',
})
export class LoginComponent implements OnInit {
    constructor(
        public appState: ApplicationState,
    ) {
    }
    ngOnInit() {
        window.location.href = '/Auth0Account/Login';
        // this.authService
        //     .login()
        //     .flatMap((_: any) => this.authService.getLoggedInUserInfo())
        //     .do(() => this.diag.logInformation(`Successful login, redirecting to '${this.authService.redirectUrl}'.`, `${LoginComponent.name}.onSubmit()`))
        //     .do(() => this.toastsManager.success('You are sign in.', 'Succusful Sign In'))
        //     .subscribe(
        //     (currentUser: any) => {
        //         this.appState.CurrentUser = currentUser
        //         let redirectUrl = this.authService.redirectUrl || '/'
        //         this.router.navigate([redirectUrl])
        //     },
        //     (error: any) => {
        //         this.toastsManager.error('Please make sure you typed your username and password correctly and try again.', 'Invalid Login')
        //         this.diag.logError('Error logging in.', `${LoginComponent.name}.onSubmit()`)
        //     })
    }
}
