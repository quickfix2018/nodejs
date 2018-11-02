import { Component } from "@angular/core";
import { DealerClientService } from "../services/dealer-client.service";
import { ToastsManager } from "ng2-toastr";
import { PolicyClientService } from "../../order/services/policy-client.service";

@Component({
    moduleId: module.id,
    templateUrl: "./dealer-contract.component.html",
})
export class DealerContractComponent {
    public currentDealer$ = this.dealerService.getCurrentDealer().share()
    public acknowledged$ = this.currentDealer$.map(d => d.ContractAcknowledged)
    public contractUrl$ = this.currentDealer$.map(d => d.ContractUrl);
    protected policyResult$ = this.policyService.dealer()

    constructor (
        private dealerService: DealerClientService,
        private policyService: PolicyClientService,
        private toastr: ToastsManager
    ) { }

    onAcknowledge() {
        this.dealerService
            .acknowledgeDealerContract()
            .first()
            .subscribe(
                () => this.currentDealer$ = this.dealerService.getCurrentDealer(),
                msg => this.toastr.error(msg)
            );
    }
}
