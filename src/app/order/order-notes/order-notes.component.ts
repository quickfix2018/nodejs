import { Component, Input } from '@angular/core'
import { OrderService } from '../services/order.service';
import { Observable } from '../../../../node_modules/rxjs';
import { IOrderNote } from '../order-note';
import { ApplicationState } from '../../_shared';
import { ToastsManager } from '../../../../node_modules/ng2-toastr';
import * as moment from 'moment'

@Component({
    selector: 'mb-order-notes',
    moduleId: module.id,
    templateUrl: 'order-notes.component.html'
})
export class OrderNotesComponent {
    notes$: Observable<IOrderNote[]>
    public newNoteText = ''
    public newNoteInternal = false
    currentUser = this.appState.CurrentUser.Email
    isAdmin = this.appState.CurrentUser.IsAdmin

    private _orderID
    @Input()
    set orderID(orderID: number) {
        this._orderID = orderID
        this.notes$ = this.orderService.getNotes(this.orderID)
    }
    get orderID() {
        return this._orderID
    }

    constructor(
        private orderService: OrderService,
        private appState: ApplicationState,
        private toastr: ToastsManager
    ) { }

    onAddNote = () =>
        this.orderService
            .addNote(this.orderID, this.newNoteText, this.newNoteInternal)
            .first()
            .subscribe(
                () => {
                    this.notes$ = this.orderService.getNotes(this.orderID)
                    this.newNoteText = ''
                    this.newNoteInternal = false
                },
                _ => this.toastr.error('An error occurred when submitting your note.'))

    toMoment = (date: Date) =>
        moment(date).fromNow()
}