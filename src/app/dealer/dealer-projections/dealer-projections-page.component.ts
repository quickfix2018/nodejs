import { Component } from "@angular/core";
import { DealerClientService } from "../services/dealer-client.service";
import { IDealerProjections } from "../idealer-projections";
import { ToastsManager } from "ng2-toastr";
import { PolicyClientService } from "../../order/services/policy-client.service";

@Component({
    template: `
        <policy-summary
            [policyResult]="policyResult$ | async"
            successMessage="You have already Acknowledged your submitted your Model Projections."
            successRoute="/manage/orders"
            successRouteName="Manage your orders"></policy-summary>

        <div *ngIf="currentDealerProjections$ | async as projections" class="container">
            <mb-dealer-projections [projections]="projections"></mb-dealer-projections>
            <div class="row">
                <button
                    [disabled]="!canSubmit(projections)"
                    (click)="submitProjections(projections)"
                    class="btn btn-primary">Submit</button>
            </div>
        </div>
    `
})
export class DealerProjectionsPageComponent {
    constructor(
        private dealerService: DealerClientService,
        private policyService : PolicyClientService,
        private toastr: ToastsManager,
    ) { }

    currentDealerProjections$ = this
        .dealerService
        .getCurrentDealerProjections()
        .share()

    private flagProjectionsList = (projectionsList: IDealerProjections[]) =>
        projectionsList.map(projections => ({
            ...projections,
            Submitted: true
        }))

    policyResult$ = this.policyService.dealer()

    submitProjections = (projections: IDealerProjections[]) =>
        this.dealerService
            .updateCurrentDealerProjections(this.flagProjectionsList(projections))
            .first()
            .subscribe(
                () => this.toastr.success("Your projections have been submitted."),
                msg => this.toastr.error("An error occured while submitting your projections.")
            )

    canSubmit = (projections: IDealerProjections[]) =>
        projections.every(p => !p.Submitted)
}