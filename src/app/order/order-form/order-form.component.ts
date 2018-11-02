import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core'
import { DatePipe } from '@angular/common'
import { Router } from '@angular/router'
import { IDealer, DealerClientService } from '../../dealer'
import { IOrder, IOrderDiscount, IOrderItem } from '../order'
import { IOrderStatus } from '../order-status'
import { OrderService } from '../services/order.service'
import { SurchargeService } from '../../surcharge'

import { Observable } from 'rxjs'
import { AuthService } from '../../auth'
import { ApplicationState, DiagnosticService, CalculationService } from '../../_shared'
import { ApplicationSettingService } from '../../application-setting'
import { IDiscount, DiscountService } from '../../discount'
import { PricingService } from '../../pricing'
import { ToastsManager } from 'ng2-toastr/src/toast-manager'
import 'lodash'
declare var _: any;

const createEmptyOrderDiscount = () => ({
    ID: 0,
    DiscountAmount: 0,
    Description: "",
    DiscountTypeID: null,
    DiscountTypeName: "",
    OrderID: null
} as IOrderDiscount)

const createEmptyOrderItem = () => ({
    ID: 0,
    Amount: 0,
    Description: "",
    OrderID: null
} as IOrderItem)


@Component({
    moduleId: module.id,
    selector: 'cwd-order-form',
    templateUrl: 'order-form.component.html',
    providers: [CalculationService, SurchargeService],
    styles: [`
        .bg-gray { background-color: #898989; } .text-white { color: #fff; } .text-bold { font-weight: bold; }
    `]
})
export class OrderFormComponent implements OnInit, OnChanges {
    @Input() order: IOrder
    @Output() onOrderSaved = new EventEmitter<IOrder>()
    @Output() onOrderDismiss = new EventEmitter()
    private _discounts: IDiscount[]

    public isoCurrencyCode$: Observable<string>
    public tempOrder: IOrder
    public dealers: IDealer[]
    public orderStatuses$: Observable<IOrderStatus[]>
    public tempOrderDate: string
    public tempSprayDate: string
    public enableDealerSelect: boolean
    public showProgram: boolean
    public tempDiscount: IOrderDiscount = createEmptyOrderDiscount()
    public invalidDateShow: boolean
    public selectedProgramID: number
    public tempOrderItem: IOrderItem = createEmptyOrderItem()

    public get factoryIncentives(): number {
        return !this.tempOrder || !this.tempOrder.OrderDiscounts ? 0
            : _.sum(this.tempOrder.OrderDiscounts
                .filter(d => !d.DiscountTypeID)
                .map(d => d.DiscountAmount))
    }
    public get dealerDiscount(): number {
        return !this.tempOrder || !this.tempOrder.OrderDiscounts ? 0
            : _.sum(this.tempOrder.OrderDiscounts
                        .filter(d => d.DiscountTypeID)
                        .map(d => d.DiscountAmount))
    }
    public set discounts(discounts: IDiscount[]) {
        this._discounts = discounts
        this.showProgram = (discounts.length > 0)
    }
    public get discounts(): IDiscount[] {
        return this._discounts
    }

    constructor(
        public settingService: ApplicationSettingService,
        public calcService: CalculationService,
        private orderService: OrderService,
        private router: Router,
        private dealerService: DealerClientService,
        private auth: AuthService,
        private appState: ApplicationState,
        private toastsManager: ToastsManager,
        private discountService: DiscountService,
        private pricingService: PricingService,
        private diag: DiagnosticService
    ) {
        this.dealers = []
        this.showProgram = false
    }
    ngOnInit() {
        this.enableDealerSelect = this.appState.CurrentUser.IsAdmin;
        this.dealerService.getDealers().subscribe(dealers => this.dealers = dealers)
        this.orderStatuses$ = this.orderService.getOrderStatuses()
        this.isoCurrencyCode$ =
            this.settingService
                .applicationSetting$
                .filter(setting => setting !== null)
                .map(setting => setting['IsoCurrencyFormat'])
        this.discounts = []
    }
    ngOnChanges(changes: SimpleChanges) {
        if (this.order) {
            this.tempOrderDate = this.order.OrderDate ? new DatePipe('en-US').transform(this.order.OrderDate, 'MM/dd/yyyy') : ''
            this.tempSprayDate = this.order.SprayDate ? new DatePipe('en-US').transform(this.order.SprayDate, 'MM/dd/yyyy') : ''
            this.loadOrder({ ...this.order })
            if (this.order.Dealer) {
                this.discountService
                    .getDiscountForOrder(this.order.ID, this.order.DealerID)
                    .subscribe(discounts => this.discounts = discounts)
            }
        }
    }

    dealerChangeEventHandler(dealerID: any) {
        let dealer = this.dealers.find(d => d.ID == dealerID)
        this.tempOrder.Dealer = dealer
        this.tempOrder.DealerID = dealer.ID
        // need to filter out program (Cash/Program) discount because the selected dealer may not
        // qualify to get discounts
        this.tempOrder.OrderDiscounts = this.tempOrder.OrderDiscounts.filter(orderDiscount => !orderDiscount.DiscountTypeID)
        this.loadDiscounts(dealerID)
        this.orderService.recalculate(this.tempOrder).subscribe(order => this.loadOrder(order))
    }
    programChangedHandler(selectedProgramID: any) {
        let selectedProgram = this.discounts.find(d => d.DiscountTypeID === (+selectedProgramID))
        this.tempOrder.WinterRebate = (!!selectedProgram)
        if (!!selectedProgram) {
            var orderDiscounts = this.tempOrder.OrderDiscounts.filter(od => !this.discounts.some(d => d.DiscountTypeID === od.DiscountTypeID))

            orderDiscounts.push({
                ID: 0,
                Description: selectedProgram.DiscountTypeName,
                OrderID: this.tempOrder.ID,
                DiscountAmount: selectedProgram.Amount,
                DiscountTypeID: selectedProgram.DiscountTypeID,
                DiscountTypeName: selectedProgram.DiscountTypeName
            })

            this.tempOrder.OrderDiscounts = orderDiscounts.sort((a, b) => a.DiscountTypeID - b.DiscountTypeID)
            this.calcService.calculateOrderTotal(this.tempOrder)
        }
    }
    saveOrderClicked() {
        this.tempOrder.OrderDate = new Date(this.tempOrderDate)
        this.tempOrder.SprayDate = new Date(this.tempSprayDate)
        this.orderService
            .updateOrder(this.tempOrder)
            .first()
            .subscribe(
                order => {
                    this.toastsManager.success('Order has been saved.', 'Order Saved')
                    this.onOrderSaved.emit(order)
                },
                err => this.toastsManager.error(err, 'Error'))
    }
    dismissedClicked() {
        this.onOrderDismiss.emit()
    }
    addDiscountClickHander() {
        this.tempOrder.OrderDiscounts.push(this.tempDiscount)
        this.tempOrder.OrderDiscounts.sort((a, b) => {
            return a.DiscountTypeID < b.DiscountTypeID ? 1
                : a.DiscountTypeID > b.DiscountTypeID ? -1
                    : 0
        })
        this.tempDiscount = createEmptyOrderDiscount()
        this.calcService.calculateOrderTotal(this.tempOrder)
    }
    removeDiscountClickHander(discount: IOrderDiscount) {
        var index = this.tempOrder.OrderDiscounts.findIndex(d => d === discount);
        if (index > -1) {
            this.tempOrder.OrderDiscounts.splice(index, 1);
            this.tempOrder.DiscountTotal = this.tempOrder.DiscountTotal - this.tempDiscount.DiscountAmount
        }
        this.calcService.calculateOrderTotal(this.tempOrder)
    }
    setOrderDateClickedHander(): void {
        this.tempOrderDate = new DatePipe('en-US').transform(new Date(), 'MM/dd/yyyy')
    }
    setSprayDateClickedHander(): void {
        this.tempSprayDate = new DatePipe('en-US').transform(new Date(), 'MM/dd/yyyy')
    }
    addOrderItemClickHander(orderItem: IOrderItem) {
        if (!orderItem.Description) {
            this.toastsManager.error('Description can not be empty.')
            return
        }
        if (!orderItem.Amount) {
            this.toastsManager.error('Amount can not be empty.')
            return
        }
        this.tempOrder.OrderItems.push(orderItem)
        this.tempOrderItem = createEmptyOrderItem()
        this.calcService.calculateOrderTotal(this.tempOrder)
    }
    removeOrderItemClickHander(orderItem: IOrderItem) {
        var index = this.tempOrder.OrderItems.findIndex(oi => oi === orderItem);
        if (index > -1) {
            this.tempOrder.OrderItems.splice(index, 1);
            this.calcService.calculateOrderTotal(this.tempOrder)
        }
    }
    getOrderItemTotal(order: IOrder): number {
        return order.OrderItems.reduce<number>((total, curr, i, arr) => total += curr.Amount, 0)
    }
    getDealerDiscounts() {
        return this.tempOrder.OrderDiscounts.filter(d => d.DiscountTypeID > 0)
    }
    getFactoryIncentives() {
        return this.tempOrder.OrderDiscounts.filter(d => !d.DiscountTypeID || d.DiscountTypeID === 0)
    }

    private loadOrder(order: IOrder) {
        this.tempOrder = order
        this.tempDiscount.OrderID = order.ID
        let foundDiscount = order.OrderDiscounts ? order.OrderDiscounts.find(d => !!d.DiscountTypeID) : null
        this.selectedProgramID = foundDiscount ? foundDiscount.DiscountTypeID : 0
        this.calcService.calculateOrderTotal(this.tempOrder)
    }
    private loadDiscounts(dealerID: number) {
        this.discountService
            .getDiscountForOrder(this.tempOrder.ID, dealerID)
            .subscribe(discounts => this.discounts = discounts)
    }
}