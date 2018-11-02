import { Injectable } from '@angular/core'
import { NotificationClientService } from './notification-client.service'
import { PagedResult, Notification } from '../notification'

import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'

const DEFAULT_PAGE = <PagedResult<Notification>> {
    hasNext: false,
    data: []
}

@Injectable()
export class NotificationService {
    constructor(
        private notificationService: NotificationClientService,
    ) {
        this.init()
    }

    private _page = 1

    private _hasNext = new BehaviorSubject(false)
    public hasNext$ = this._hasNext.asObservable()

    private _loading = new BehaviorSubject(false)
    public loading$ = this._loading.asObservable()

    public _notifications = new BehaviorSubject(DEFAULT_PAGE)
    public notifications$ = this
        ._notifications
        .asObservable()
        .scan((prev, curr) => (
            <PagedResult<Notification>> {
                hasNext: curr.hasNext,
                data: prev.data.concat(curr.data)
            }),
            DEFAULT_PAGE)

    init() {
        this.loadPage(this._page)
    }

    private loadPage(page: number) {
        this._loading.next(true)

        this.notificationService
            .getNotifications(page)
            .first()
            .subscribe(ns => {
                this._page += (ns.hasNext) ? 1 : 0
                this._hasNext.next(ns.hasNext)
                this._notifications.next(ns)
            },
            () => { }, // error
            () => { this._loading.next(false) }
        )
    }

    public nextPage() {
        this.loadPage(this._page)
    }

    public unreadNotifications$ = this
        .notifications$
        .map(ns => ns.data.filter(n => !n.read))

    public readAll = () =>
        this.notificationService.readAllNotifications()
}