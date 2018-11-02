import { Component } from "@angular/core";
import { DealerClientService } from "../../dealer";

@Component({
    template: `
        <div class="container">
            <div class="jumbotron">
                <mb-dealer-card [dealer]="dealer$ | async"></mb-dealer-card>
            </div>
        </div>
    `
})
export class ProfilePageComponent {
    constructor (
        private dealerService: DealerClientService
    ) { }

    dealer$ = this.dealerService.getCurrentDealer()
}