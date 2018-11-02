import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
    selector: 'mb-order-notes-modal',
    moduleId: module.id,
    templateUrl: 'order-notes-modal.component.html'
})
export class OrderNotesModalComponent {
    @Input() orderID: number
    @Output() onDismiss = new EventEmitter()

    constructor() { }

    onNoteDismiss = () =>
        this.onDismiss.emit()
}
