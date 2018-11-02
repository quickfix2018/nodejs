import { Injectable } from '@angular/core'
import { Http } from '@angular/http'

import { BaseProxy } from '../../_shared/services/base-proxy.service'
import { DiagnosticService } from '../../_shared/services/diagnostic.service'
import { Notification, PagedResult } from '../notification'
import { AuthService } from '../../auth'

import { Observable } from 'rxjs/Observable';
import * as moment from 'moment'

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: 1, read: false, message: 'AWS has submited Order: 12345', date: new Date('12/26/2017') },
    { id: 2, read: false, message: 'test2', date: new Date('1/22/2018') },
    { id: 3, read: false, message: 'test3', date: new Date('1/26/2018') },
]

@Injectable()
export class NotificationClientService extends BaseProxy {
    constructor(
        http: Http,
        diag: DiagnosticService,
        auth: AuthService
    ) {
        super(http, diag, '/', 'api/customwise/notification')
    }

    public getNotifications = (page = 1) =>
        //Observable.of(MOCK_NOTIFICATIONS)
        this.httpGet(`?page=${page}`, res => <PagedResult<Notification>>res.json())

    public readAllNotifications = () =>
        this.httpPost('/read/all', { }, () => { this._diag.logInformation('Marking all notifications as read.') })
}
