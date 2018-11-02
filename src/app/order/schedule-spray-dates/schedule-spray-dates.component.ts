import { Component, OnDestroy } from '@angular/core'
import { ScheduledService } from '../../ng-flowscheduler/services/scheduled.service';
import { Scheduled } from '../../ng-flowscheduler/schedule-type';
import { Observable } from 'rxjs/Observable';
import { IOrder } from '../order';
import { OrderService } from '../index';
import { ApplicationSettingService } from '../../application-setting';
import { ConfigurationService } from '../../configuration';
import { ToastsManager } from 'ng2-toastr/src/toast-manager';
import { PagingService } from '../../_shared'
import { orderUnscheduledPagingServiceFactory, orderPageInfo } from '../order-paging-factory'

export function scheduleServiceFactory(orderService: OrderService, pagingService: PagingService<IOrder[], IOrder, orderPageInfo>){
    return new ScheduledService<IOrder>(
        pagingService.items$,
        (y, m) => orderService.getScheduledOrders(y, m),
        (y, w) => orderService.getScheduledOrdersByWeek(y, w),
        "SprayDate",
        "SprayDateScheduleType")
}

@Component({
    moduleId: module.id,
    templateUrl: 'schedule-spray-dates.component.html',
    providers: [
        OrderService,
        {
            provide: PagingService,
            useFactory: orderUnscheduledPagingServiceFactory,
            deps: [ OrderService ]
        }, {
            provide: ScheduledService,
            useFactory: scheduleServiceFactory,
            deps: [ OrderService, PagingService ]
        }]
})
export class ScheduleSprayDatesComponent implements OnDestroy {
    constructor (
        private pagingService: PagingService<IOrder[], IOrder, orderPageInfo>,
        private scheduler: ScheduledService<IOrder>,
        private appSettings: ApplicationSettingService,
        private configService: ConfigurationService,
        private orderService: OrderService,
        private toastr: ToastsManager,
    ) { }

    private imageLookup = { }
    private hasNext = false

    private imgLookupSub = this
        .scheduler
        .items$
        .subscribe(orders => {
            this.imageLookup =
                orders.reduce(
                    (prev, curr) => {
                        prev[curr.ConfigurationID] = this.getConfigurationImage$(curr.ConfigurationID)

                        return prev
                    }, { })
        })

    getConfigurationImage$(configurationID: number) {
        return this
        .appSettings
        .applicationSetting$
        .filter(setting => !!setting)
        .map(setting => setting['StoragePublicBaseUrl'])
        .switchMap(baseUrl => this
            .configService
            .getConfigurationImage(configurationID, 'Exterior', 'sm')
            .map(imgUrl => imgUrl || 'no-image.png')
            .map(imgUrl => `${baseUrl}${imgUrl}`))
        }

    private selectSub = this
        .scheduler
        .itemSelected$
        .subscribe(i => console.log('thing', i))

    private scheduleSub = this
        .scheduler
        .itemScheduled$
        .do(([o, d]) => o.SprayDate = d)
        .do(([o, d]) => o.SprayDateScheduleType = Scheduled.Scheduled)
        .switchMap(([o, d]) => this.orderService.scheduleOrder(o, 'SprayDate', d, Scheduled.Scheduled))
        .subscribe(
            _ => this.toastr.success('Successfully scheduled order.'),
            _ => this.toastr.error('Error while scheduling order.')
        )

    private softScheduleSub = this
        .scheduler
        .itemScheduledMonth$
        .do(([o, d]) => o.SprayDate = d)
        .do(([o, d]) => o.SprayDateScheduleType = Scheduled.SoftMonthYear)
        .switchMap(([o, d]) => this.orderService.scheduleOrder(o, 'SprayDate', d, Scheduled.SoftMonthYear))
        .subscribe(
            _ => this.toastr.success('Successfully scheduled order.'),
            _ => this.toastr.error('Error while scheduling order.')
        )

    private unscheduleSub = this
        .scheduler
        .itemUnscheduled$
        .do(o => o.SprayDate = null)
        .do(o => o.SprayDateScheduleType = Scheduled.Unscheduled)
        .switchMap(o => this.orderService.scheduleOrder(o, 'SprayDate', null, Scheduled.Unscheduled))
        .subscribe(
            _ => this.toastr.success('Successfully unscheduled order.'),
            _ => this.toastr.error('Error while unscheduling order.')
        )

    private hasNextSub = this
        .pagingService
        .hasNext$
        .subscribe(
            next => this.hasNext = next
        )

    public scrollCallback(){
        this.pagingService.getNext()}

    ngOnDestroy() {
        this.selectSub.unsubscribe()
        this.imgLookupSub.unsubscribe()
        this.scheduleSub.unsubscribe()
        this.softScheduleSub.unsubscribe()
        this.unscheduleSub.unsubscribe()
    }
}