import { Component } from '@angular/core'
import { ApplicationState, DiagnosticService } from '../../_shared'
import { NotificationService } from '../services/notification.service'
import { Observable } from 'rxjs/Observable'
import * as moment from 'moment'

@Component({
    moduleId: module.id,
    selector: 'notification-menu',
    templateUrl: 'notification-menu.component.html',
    styleUrls: [ 'notification-menu.component.css' ],
})
export class NotificationMenuComponent {
    constructor(
        public notificationService: NotificationService
    ) {}

    public notificationList$ = this
        .notificationService
        .notifications$
        .map(ns => 
            ns.data.map(n => ({
                id: n.id,
                message: n.message,
                read: n.read,
                date: moment(n.date).fromNow()
            })))

    showNotifications() {
        this.notificationService
            .readAll()
            .first()
            .subscribe()
    }

    public more(event: Event) {
        event.preventDefault()
        event.cancelBubble = true
        this.notificationService.nextPage()
    }
}