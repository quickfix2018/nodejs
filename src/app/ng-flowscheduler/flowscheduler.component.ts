import {
    Component,
    OnInit,
    Directive,
    Input,
    Output,
    TemplateRef,
    ContentChildren,
    QueryList,
    AfterContentInit,
    EventEmitter,
    ChangeDetectorRef,
    ChangeDetectionStrategy,
    NgZone,
    ElementRef,
    AfterViewChecked } from '@angular/core'
import { ScheduledService } from './services/scheduled.service'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import * as moment from 'moment'
import { Observable } from 'rxjs/Observable'
import { Scheduled } from './schedule-type';

@Directive({
    selector: '[itemTemplate]',

})
export class ItemTemplate<T> {
    @Input() type: string
    @Input('itemTemplate') name: string

    constructor(public template: TemplateRef<T>) {}

    getType(): string { return this.name }
}

@Component({
    selector: 'ng-flowscheduler',
    templateUrl: './flowscheduler.component.html',
    styleUrls: ['./flowscheduler.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})

export class FlowSchedulerComponent<T> implements OnInit, AfterContentInit, AfterViewChecked {
    @ContentChildren(ItemTemplate) templates: QueryList<any>
    @Input()
    scrollCallback: () => Observable<any>

    unscheduledTemplate: TemplateRef<T>
    monthTemplate: TemplateRef<T>
    weekTemplate: TemplateRef<T>

    selectedMonth: number = 0
    selectedWeek: number = 0

    draggedItem: T = null

    unscheduledDragEnterClass: string = ""
    monthDragEnterClass: string = ""

    weekdays$ = this
        .scheduler
        .activeWeekdays$
        .map(ds => ds.map(d => ({
            date: d.date,
            items$: d.items$,
            cssClass: ""
        })))

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        public scheduler: ScheduledService<T>,
        private ref: ChangeDetectorRef
    ) { }

    ngOnInit() { }

    dragStart(event, item: T) {
        this.changeDetectorRef.markForCheck()
        this.draggedItem = item
    }

    dragEnterUnscheduled(event) {
        this.unscheduledDragEnterClass = 'drag-enter'
        this.changeDetectorRef.markForCheck()
    }

    dragLeaveUnscheduled(event) {
        this.unscheduledDragEnterClass = ''
    }

    dragEnterMonth(event) {
        this.monthDragEnterClass = 'drag-enter'
        this.changeDetectorRef.markForCheck()
    }

    dragLeaveMonth(event) {
        this.monthDragEnterClass = ""
    }

    dragEnterDay(event, day: { date: moment.Moment, items$: Observable<T[]>, cssClass: string}) {
        day.cssClass = 'drag-enter'
        this.changeDetectorRef.markForCheck()
    }

    dragLeaveDay(event, day: { date: moment.Moment, items$: Observable<T[]>, cssClass: string}) {
        day.cssClass = ''
        this.changeDetectorRef.markForCheck()
    }

    dragEnd(event) {
        event.path[0].removeAttribute('style')
        this.draggedItem = null
    }

    click(item: T) {
        this.scheduler.itemSelected(item)
    }

    dropMonth(event) {
        if (!this.draggedItem) { return }

        this.scheduler.setMonth(this.draggedItem, moment().add(this.selectedMonth, "months").toDate())
    }

    dropDay(event, day: { date: moment.Moment, items$: Observable<T[]>, cssClass: string}) {
        if (!this.draggedItem || this.scheduler.resolveScheduleType(this.draggedItem) === Scheduled.Scheduled) { return }

        this.scheduler.setScheduled(this.draggedItem, day.date.toDate())
    }

    dropUnscheduled(event) {
        if (!this.draggedItem) { return }

        this.scheduler.setUnscheduled(this.draggedItem)
    }
    ngAfterContentInit() {
        this.templates.forEach((item) => {
            switch(item.getType()) {
                case 'unscheduled':
                    this.unscheduledTemplate = item.template
                    break
                case 'month':
                    this.monthTemplate = item.template
                    break
                case 'week':
                    this.weekTemplate = item.template
                    break
            }
        })
    }
    ngAfterViewChecked() { }
}