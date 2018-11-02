import { Component, Output, EventEmitter, Input } from "@angular/core";
import { DealerClientService, IDealer } from "..";

@Component({
    selector: 'mb-dealer-list',
    template: `
        <div class="list-group">
        <a *ngFor="let dealer of dealers"
            (click)="selectDealer($event, dealer)"
            [ngClass]="{ active: dealer === currentDealer }"
            href="#"
            class="list-group-item"
            >{{ dealer.Name }}</a>
        </div>
    `
})
export class ManageDealerListComponent {
    currentDealer: IDealer

    @Input()
    dealers: IDealer[] = []

    @Output()
    dealerSelected = new EventEmitter<IDealer>()

    selectDealer = (event: Event, dealer: IDealer) => {
        event.preventDefault()
        this.currentDealer = dealer
        this.dealerSelected.emit(dealer)
    }
}