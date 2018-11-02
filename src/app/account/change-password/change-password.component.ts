import { Component, OnInit, Input } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '../../auth'
import { DiagnosticService } from '../../_shared'
import { ToastsManager } from 'ng2-toastr/src/toast-manager'

@Component({
    selector: "change-password",
    moduleId: module.id,
    templateUrl: "./change-password.component.html",
    styleUrls: [ "./change-password.component.css" ]
})
export class ChangePasswordComponent implements OnInit {
    @Input()
    public returnRoute: string = "/"

    public oldPassword: string
    public newPassword: string
    public confirmPassword: string

    constructor(
        private diag: DiagnosticService,
        private router: Router,
        private authService: AuthService,
        private toastsManager: ToastsManager
    ){ }

    ngOnInit() {

    }

    onCancel() {
        this.router.navigate([this.returnRoute])
    }

    onSubmit() {
        this.diag.logInformation("Current user requested a password change.", ChangePasswordComponent.name)
        this.authService
            .changePassword(this.oldPassword, this.newPassword, this.confirmPassword)
            .subscribe(
            (success:boolean) => {
                this.diag.logInformation(`Password change returned with value: ${success}`)
                this.authService.logout();
                this.router.navigate(["/login"])
                this.toastsManager.success("You have successfully changed your password. Please login with your new password.", "Your password was successfully changed")
            },
            (error: any) => {
                this.diag.logInformation(`Password change failed. Message: ${error}`)
                this.toastsManager.error("There was an error changing your password. Please make sure you have confirmed your password correctly.", "Password was not changed")
            })
    }
}
