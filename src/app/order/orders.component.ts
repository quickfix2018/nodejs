import { Component, ViewChild, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { DiagnosticService, ApplicationState, PagingService } from '../_shared'
import { IOrder } from './order'
import { OrderService } from './services/order.service'
import { Observable } from 'rxjs/Observable'
import { DiscountService } from '../discount'
import { ApplicationSettingService } from '../application-setting'
import { ModalDirective } from 'ngx-bootstrap/modal'
import { ConfigurationService } from '../configuration';
import { ToastsManager } from 'ng2-toastr/src/toast-manager'
import { orderPagingServiceFactory, orderPageInfo } from './order-paging-factory'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/mergeMap'

@Component({
    moduleId: module.id,
    templateUrl: 'orders.component.html',
    styleUrls: [ 'orders.component.css' ],
    providers: [
        OrderService,
        DiscountService,
        {
            provide: PagingService,
            useFactory: orderPagingServiceFactory,
            deps: [ OrderService ]
        }
    ]
})
export class OrderComponent implements OnInit {
    orders$: Observable<IOrder[]>
    @ViewChild('orderEditModal') public orderEditModal: ModalDirective
    @ViewChild('notesModal') public notesModal: ModalDirective
    action: string
    selectedOrder: IOrder
    notesOrder: IOrder
    lockLookup = {}
    public imageLookup = {}
    public isoCurrencyCode$: Observable<string>
    public fields = [
        { value: 'ID', displayName: 'Order ID'},
        { value: 'HullID', displayName: 'Hull ID'},
        { value: 'EngineID', displayName: 'Engine ID'},
        { value: 'TransmissionID', displayName: 'Transmission ID'},
        { value: 'TrailerID', displayName: 'Trailer ID'},
    ]
    public orderField = this.fields[0]

    public orderDirections = [
        { value: '0', displayName: 'Ascending'},
        { value: '1', displayName: 'Descending'}
    ]
    public orderDirection = this.orderDirections[1]

    constructor(
        public settingService: ApplicationSettingService,
        public configService: ConfigurationService,
        private diag: DiagnosticService,
        private orderService: OrderService,
        public appState: ApplicationState,
        private router: Router,
        private toastr: ToastsManager,
        private pagingService: PagingService<IOrder[], IOrder, orderPageInfo>,
    ) { }
    ngOnInit() {
        this.orders$ = this
            .pagingService
            .items$
            .do(orders =>
                this.imageLookup =
                    orders.reduce(
                        (prev, curr) => {
                            prev[curr.ConfigurationID] = this.getConfigurationImage$(curr.ConfigurationID)
                            return prev
                        }, { }))
            .do(orders => this
                .configService
                .getConfigurationsLockState(orders.map(o => o.ConfigurationID))
                .map(this.toLookup)
                .subscribe(data => this.lockLookup = data))
        this.isoCurrencyCode$ =
            this.settingService
                .applicationSetting$
                .filter(setting => setting !== null)
                .map(setting => setting['IsoCurrencyFormat'])
        this.appState.resetImpersonation()
    }
    getConfigurationImage$(configurationID: number) {
        return this
            .settingService
            .applicationSetting$
            .filter(setting => !!setting)
            .map(setting => setting['StoragePublicBaseUrl'])
            .switchMap(baseUrl => this
                .configService
                .getConfigurationImage(configurationID, 'Exterior', 'sm')
                .map(imgUrl => imgUrl || 'no-image.png')
                .map(imgUrl => `${baseUrl}${imgUrl}`))
    }
    private toLookup = (states: any[]) => states.reduce(
        (prev, curr) => {
            prev[curr.id] = curr.locked
            return prev
        }, {})

    actionClick(route: string, orderID: number) {
        window.open(`${route}/${orderID}`, `_newTab${route.replace('/', '')}_${orderID}`, null, false)
    }
    retailPrintClick(route: string, configID: number) {
        window.open(`${route}/${configID}`, `_newTab${route.replace('/', '')}_${configID}`, null, false)
    }
    showNotes(order: IOrder) {
        this.notesOrder = order
        this.notesModal.show()
    }
    dismissNotes = () => {
        this.notesOrder = undefined
        this.notesModal.hide()
    }
    editOrderClicked(order: IOrder) {
        this.selectedOrder = order
        this.orderEditModal.show()
        //this.orderEditModal.onHidden.subscribe(() => this.selectedOrder = null)
    }
    editModelClicked(order: IOrder) {
        if (this.appState.CurrentUser.IsAdmin && order.Dealer) {
            this.appState.setImpersonation(order.Dealer.PricingLevel, order.DealerID, order.Dealer.Name)
        }
        let discount = order.OrderDiscounts.find(orderDiscount => !!orderDiscount.DiscountTypeID)
        this.appState.selectedProgram = null;

        if (discount) {
            this.appState.selectedProgram = {
                DiscountTypeID: discount.DiscountTypeID,
                Amount: discount.DiscountAmount,
                DiscountKey: '',
                DiscountTypeName: discount.DiscountTypeName,
                PriceLevel: order.Dealer.PricingLevel
            }
        }
        this.appState.editOrder = order
        this.router.navigate(['/config/', order.ConfigurationID])
    }
    setSorting(field: any, direction: any) {
        this.orderField = field
        this.orderDirection = direction
    }
    configurationLock(orderId: number, lockState: boolean) {
        this.orderService
            .lockOrder(orderId, lockState)
            .first()
            .subscribe(
                () => this.toastr.success(`Order '${orderId}' has been ${ lockState ? 'locked' : 'unlocked' }.`),
                msg => this.toastr.error(`An error occured while updating lock for order '${orderId}'. Message: ${msg}`)
            )
    }
    onScroll = () =>
        this.pagingService.getNext()

    orderChangesDismissed = () =>
        this.orderEditModal.hide()

    orderSaved = (order: IOrder) => {
        // copy order back to item
        this.selectedOrder.DealerID =  order.DealerID
        this.selectedOrder.Dealer =  order.Dealer
        this.selectedOrder.OrderStatusID =  order.OrderStatusID
        this.selectedOrder.ModelName =  order.ModelName
        this.selectedOrder.DealerPO =  order.DealerPO
        this.selectedOrder.HullID =  order.HullID
        this.selectedOrder.OrderDate =  order.OrderDate
        this.selectedOrder.EngineID =  order.EngineID
        this.selectedOrder.TransmissionID =  order.TransmissionID
        this.selectedOrder.ConfigurationID =  order.ConfigurationID
        this.selectedOrder.TrailerID =  order.TrailerID
        this.selectedOrder.FinancedBy =  order.FinancedBy
        this.selectedOrder.Freight =  order.Freight
        this.selectedOrder.Trailer =  order.Trailer
        this.selectedOrder.OptionsTotal =  order.OptionsTotal
        this.selectedOrder.DealerBoatPrice =  order.DealerBoatPrice
        this.selectedOrder.Surcharge =  order.Surcharge
        this.selectedOrder.SubTotal =  order.SubTotal
        this.selectedOrder.Total =  order.Total
        this.selectedOrder.CreatedBy =  order.CreatedBy
        this.selectedOrder.CreatedDate =  order.CreatedDate
        this.selectedOrder.ModifiedBy =  order.ModifiedBy
        this.selectedOrder.ModifiedDate =  order.ModifiedDate
        this.selectedOrder.WinterRebate =  order.WinterRebate
        this.selectedOrder.OrderSurcharges =  order.OrderSurcharges
        this.selectedOrder.OrderDiscounts =  order.OrderDiscounts
        this.selectedOrder.DiscountTotal =  order.DiscountTotal
        this.selectedOrder.OrderItems =  order.OrderItems
        this.selectedOrder.SprayDate =  order.SprayDate
        this.selectedOrder.SprayDateScheduleType =  order.SprayDateScheduleType

        this.orderEditModal.hide()

        // dereference
        this.selectedOrder = undefined
    }
}