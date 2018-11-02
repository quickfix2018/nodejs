import { Component } from "@angular/core";
import { IDealer, DealerClientService } from "..";

@Component({
    template: `
        <div class="container">
            <div class="col-md-3">
                <mb-dealer-list [dealers]="dealers$ | async" (dealerSelected)="onDealerSelected($event)" ></mb-dealer-list>
            </div>
            <div class="col-md-9">
                <mb-dealer-card [dealer]="currentDealer"></mb-dealer-card>
            </div>
        </div>`
})
export class ManageDealerPageComponent {
    constructor(
        private dealerService: DealerClientService
    ) { }

    dealers$ = this
        .dealerService
        .getDealers()

    currentDealer: IDealer

    onDealerSelected = (dealer: IDealer) => this.currentDealer = dealer
}