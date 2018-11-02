import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/do'

import * as moment from 'moment';
import { Scheduled } from '../schedule-type';
import { Data } from '@angular/router/src/config';
import { IfObservable } from 'rxjs/observable/IfObservable';

@Injectable()
export class ScheduledService<T> {
    private _activeMonth = moment().startOf('month')
    private _activeMonthSubject = new BehaviorSubject(this._activeMonth)
    public activeMonth$ = this._activeMonthSubject.asObservable()

    private _activeWeek = moment().startOf('isoWeek')
    private _activeWeekSubject = new BehaviorSubject(this._activeWeek)
    public activeWeek$ = this._activeWeekSubject.asObservable()

    public scheduledWeek$ = this
        .activeWeek$
        .switchMap(week => this.getWeekItems(week.year(), week.isoWeek()).share())

    public activeWeekdays$ = this
        .activeWeek$
        .map(week => ({ week, items$: this.getWeekItems(week.year(), week.isoWeek()).share()}))
        .map(wi => Array
            .from(new Array(7), (_,i) => i)
            .map(weekdayNumber => wi.week.clone().add(weekdayNumber, 'd'))
            .map(date => ({
                date,
                items$: wi.items$
                    .map(items => items
                        .filter(i => moment(this.resolveDateValue(i)).isSame(date.toDate(), "day")))
            })))

    public addMonth(offset = 1) {
        this._activeMonth.add(offset, "month")
        this._activeMonthSubject.next(this._activeMonth)
    }

    public addWeek(offset = 1) {
        this._activeWeek.add(offset, "w")
        this._activeWeekSubject.next(this._activeWeek)
    }

    private _items: T[] = []
    private _itemsSubject = new BehaviorSubject(this._items)
    public items$ = this._itemsSubject.asObservable()

    private _itemUnscheduledSubject = new Subject<T>()
    private _itemScheduledMonthSubject = new Subject<[T, Date]>()
    private _itemScheduledSubject = new Subject<[T, Date]>()
    private _itemSelectedSubject = new Subject<T>()

    itemUnscheduled$ = this._itemUnscheduledSubject.asObservable();
    itemScheduledMonth$ = this._itemScheduledMonthSubject.asObservable();
    itemScheduled$ = this._itemScheduledSubject.asObservable()
    itemSelected$ = this._itemSelectedSubject.asObservable()

    public scheduled$ = this
        .items$
        .map(items => items.filter(this._filterScheduled))

    public unscheduled$ = this
        .items$
        .map(items => items.filter(this._filterUnscheduled))

    public scheduledMonth$ = this
        .activeMonth$
        .switchMap(monthDate =>
            this.getMonthItems(monthDate.year(), monthDate.month() + 1))

    private _filterScheduled = (i: T) => this.resolveScheduleType(i) === Scheduled.Scheduled
    private _filterUnscheduled = (i: T) => this.resolveScheduleType(i) === Scheduled.Unscheduled

    constructor(
        initems$: Observable<T[]>,

        private getMonthItems: (year: number, month: number) => Observable<T[]>,
        private getWeekItems: (year: number, month: number) => Observable<T[]>,

        private dateField: string,
        private scheduleTypeField: string,
    ) {
        initems$.subscribe(is => this._itemsSubject.next(this._items = is))
    }

    private resolveDateValue = (item: T) => new Date(item[this.dateField])
    public resolveScheduleType = (item: T) => <Scheduled>item[this.scheduleTypeField]

    getScheduledDay$(day: Date) {
        return this
            .scheduledWeek$
            .map(items => items
                .filter(i => moment(this.resolveDateValue(i)).isSame(day, "day")))
    }

    setUnscheduled(item:T) {
        this._itemUnscheduledSubject.next(item)
        this._itemsSubject.next(this._items)
    }

    setMonth(item:T, date: Date) {
        this._itemScheduledMonthSubject.next([item, date])
        this._itemsSubject.next(this._items)
    }

    setScheduled(item: T, date: Date) {
        this._itemScheduledSubject.next([item, date])
        this._itemsSubject.next(this._items)
    }

    itemSelected(item: T) {
        this._itemSelectedSubject.next(item)
    }
}