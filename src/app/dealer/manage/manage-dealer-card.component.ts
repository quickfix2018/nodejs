import { Component, Input } from "@angular/core";
import { IDealer, DealerClientService, IDealerProjections } from "..";
import { Observable } from "rxjs/Observable";

@Component({
    selector: 'mb-dealer-card',
    template: `
        <div *ngIf="dealer">
            <h2>{{ dealer?.Name || 'Default' }}</h2>
            <address>
                {{ dealer.Street }}<br>
                {{ dealer.City }}, {{ dealer.State }} {{ dealer.Zip }}<br>
                Phone: {{ dealer.Phone }}<br>
                Fax: {{ dealer.Fax }}
            </address>
            <p>
                Contract Acknowledged: <strong>{{ dealer.ContractAcknowledged ? 'Yes' : 'No' }}</strong>
                <a *ngIf="dealer.ContractUrl" href="{{ dealer.ContractUrl }}" target="_blank" class="btn btn-primary"><i class="fa fa-save"></i> Download Contract</a>
            </p>

            <h2>Projections</h2>
            <mb-dealer-projections [projections]="projections$ | async"></mb-dealer-projections>
        </div>
    `
})
export class ManageDealerCardComponent {
    private _dealer = <IDealer>{ }
    @Input()
    set dealer(dealer: IDealer) {
        if (!dealer) { return }
        this._dealer = dealer
        this.projections$ = this.dealerService.getDealerProjections(this._dealer.ID).take(1)
    }
    get dealer() { return this._dealer }

    constructor(
        private dealerService: DealerClientService
    ) { }

    projections$: Observable<IDealerProjections[]>
}