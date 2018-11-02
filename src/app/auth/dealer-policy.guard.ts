import { Injectable } from '@angular/core'
import { inject } from '@angular/core/testing';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { PolicyClientService } from '../order/services/policy-client.service'
import { PolicyStatus } from '../order/services/policy-status'
import { Observable } from 'rxjs/Observable'
import { ToastsManager } from 'ng2-toastr/src/toast-manager'

@Injectable()
export class DealerPolicyGuard implements CanActivate {
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.policyService
            .dealer()
            .map(res => {
                if (res.Status === PolicyStatus.Success) {
                    return true;
                } else {
                    if (res.Correctable) {
                        this.router.navigate([`${res.CorrectableAction}`])
                    } else {
                        throw new Error(`${res.FailureMessage}`)
                    }
                    return false;
                }
            })
            .catch(err =>
                Observable
                    .of(false)
                    .do(_ => this
                        .toastr
                        .error(err.message || "An error occured while retrieving the Dealer Status.")) )
    }

    constructor(
        private router: Router,
        private policyService : PolicyClientService,
        private toastr: ToastsManager
    ) { }
}