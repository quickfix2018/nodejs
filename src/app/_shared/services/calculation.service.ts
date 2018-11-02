import { Injectable, Output, EventEmitter } from '@angular/core'
import { ToastsManager } from 'ng2-toastr/src/toast-manager'
import { Subscription } from 'rxjs/Rx'
import 'lodash'
declare var _: any;

import { ISurchargeType, SurchargeService } from '../../surcharge'
import { ApplicationState } from '../application-state'
import { IConfiguration, IConfigurationItem } from '../../configuration'
import { IOrderSurcharge, IOrder } from '../../order'
import { IDealer, DealerClientService } from '../../dealer'
import { AuthService } from '../../auth'
import { DiagnosticService } from './diagnostic.service'
import { trailerFilter, notTrailerFilter } from '../../configuration/mb-helpers'

export class TotalSummary {
    BasePrice: number;
    //DiscountTotal: number;
    DealerDiscount: number;
    FactoryIncentive: number;
    BoatTotal: number;
    OptionsTotal: number;
    Trailer: number;
    Freight: number;
    SubTotal: number;
    Surcharge: number;
    Total: number;
    OrderItemsTotal: number;
}

@Injectable()
export class CalculationService {
    @Output() onTotalChangedEvent = new EventEmitter<TotalSummary>()
    @Output() onDealerLoaded = new EventEmitter<IDealer[]>()

    private metadataKey: string = 'domain.mb.color.texture'
    private discountMetadataKey: string = 'domain.mb.rebate.key'
    private surchargeKey: string = 'Surcharge'

    private surchargeTypes: ISurchargeType[]
    private serviceName: string = CalculationService.name

    public CurrTotalSummary: TotalSummary
    public CurrGelUpcharge: IOrderSurcharge[]
    public DealerList: IDealer[]

    constructor(
        private surchargeService: SurchargeService,
        private appState: ApplicationState,
        private toastr: ToastsManager,
        private dealerService: DealerClientService,
        private auth: AuthService,
        private diag: DiagnosticService,
    ) {
        this.loadSurchargeTypes()
        this.CurrTotalSummary = new TotalSummary()
        this.appState
            .onConfigurationChanged
            .subscribe((c: IConfiguration) => this.calculateTotal(c),
                (error: any) => {
                    this.diag.logError(error.toString(), `${this.serviceName}.constructor()`)
                    this.toastr.error('Error while calculating totals.', 'Error')
                })
        if (auth.isLoggedIn()) {
            let dealerSubscription: Subscription =
                dealerService
                    .getDealers()
                    .subscribe(dealers => this.DealerList = dealers,
                        error => {
                            this.diag.logError(error.toString(), `${this.serviceName}.constructor()`)
                            this.toastr.error('Error loading system data', 'Error')
                        },
                        () => dealerSubscription.unsubscribe())
        }
    }

    public calculateTotal(configuration: IConfiguration) {
        let colorAreas = configuration.Items.filter(c => c.ValueData && c.ValueData[this.metadataKey])
        let groupedData = _.groupBy(colorAreas, (c:IConfigurationItem) => c.ValueData[this.metadataKey])
        let deckSwimstepAreas = colorAreas.filter(ci => ci.KeyDisplayName.toLowerCase() === "gel 1" || ci.KeyDisplayName.toLowerCase() === "swimstep")
        let groupedDeckSwimstepData = _.groupBy(deckSwimstepAreas, (c:IConfigurationItem) => c.ValueData[this.metadataKey])

        if (this.surchargeTypes) {
            let data =
                this.surchargeTypes
                    .map(surchargeType => {
                        let surchargeClone = _.clone(surchargeType)

                        surchargeClone.ItemCount = (
                                surchargeClone.SystemName === 'StdDealerDeckSwimstepMetallicGelcoatSurcharge' ||
                                surchargeClone.SystemName === 'DeckSwimstepMetallicGelcoatSurcharge' ||
                                surchargeClone.SystemName === 'StdDealerDeckSwimstepPearlGelcoatSurcharge' ||
                                surchargeClone.SystemName === 'DeckSwimstepPearlGelcoatSurcharge')

                                ? surchargeType
                                    .Code
                                    .split(',')
                                    .map(ci => _.uniqBy(groupedDeckSwimstepData[ci], 'ValueDisplayName').length)
                                    .reduce((p, c) => p + c)

                                : surchargeType
                                    .Code
                                    .split(',')
                                    .map(c => _.uniqBy(groupedData[c], 'ValueDisplayName').length)
                                    .reduce((p, c) => p + c)

                        return surchargeClone
                    })
            this.surchargeService
                .calcSurcharges(data)
                .do(orderSurcharges => this.CurrGelUpcharge = orderSurcharges)
                .map(orderSurcharges => (orderSurcharges ? _.sum(orderSurcharges.map(os => os.Amount)) : 0))
                .map(surchargeTotal => this.createCalculateOrderTotal(
                    this.appState.editOrder,
                    configuration.RootSpecificationPrice,
                    _.sum(configuration.Items.filter(notTrailerFilter).map(c => c.Price || 0)) + surchargeTotal,
                    this.appState.editOrder ? _.sum(this.appState.editOrder.OrderItems.map(oi => oi.Amount)) : 0,
                    _.sum(configuration.Items.filter(trailerFilter).map(c => c.Price || 0)),
                    this.getDealerDiscount(configuration),
                    this.getFactoryIncentive()
                ))
                .do(totalSummary => this.CurrTotalSummary = totalSummary)
                .subscribe(totalSummary => this.onTotalChangedEvent.emit(totalSummary))
        }
    }

    private createCalculateOrderTotal(order: IOrder, basePrice: number, optionsTotal: number, orderItemsTotal: number, trailerTotal: number, dealerDiscountsTotal: number, factoryIncentiveTotal: number) {
        const totalSummary = new TotalSummary()

        totalSummary.BasePrice = basePrice
        totalSummary.OptionsTotal = optionsTotal
        totalSummary.OrderItemsTotal = orderItemsTotal
        totalSummary.DealerDiscount = dealerDiscountsTotal
        totalSummary.BoatTotal = totalSummary.BasePrice - totalSummary.DealerDiscount
        totalSummary.Trailer = trailerTotal
        totalSummary.Freight = order ? order.Freight : 0
        totalSummary.SubTotal =
            totalSummary.BoatTotal +
            totalSummary.Trailer +
            totalSummary.Freight +
            totalSummary.OptionsTotal +
            totalSummary.OrderItemsTotal
        totalSummary.Surcharge = +Number(totalSummary.SubTotal * this.getDealerSurcharge()).toFixed(2)
        totalSummary.FactoryIncentive = factoryIncentiveTotal
        totalSummary.Total = totalSummary.SubTotal + totalSummary.Surcharge - totalSummary.FactoryIncentive

        return totalSummary
    }
    public calculateOrderTotal(order: IOrder) {
        this.CurrTotalSummary = this.createCalculateOrderTotal(
            order,
            order.DealerBoatPrice,
            order.OptionsTotal,
            _.sum(order.OrderItems.map(oi => oi.Amount)),
            order.Trailer,
            _.sum(order.OrderDiscounts.filter(d => d.DiscountTypeID).map(d => d.DiscountAmount)),
            this.getOrderFactoryIncentive(order)
        )
    }
    private getDealerSurcharge(): number {
        let dealer = this.DealerList ? this.DealerList.find(d => d.ID === this.appState.CurrentUser.DealerID) : null
        return dealer ? +dealer.Settings[this.surchargeKey] : 0
    }
    private getFactoryIncentive(): number {
        return !this.appState.editOrder || !this.appState.editOrder.OrderDiscounts ? 0 : this.getOrderFactoryIncentive(this.appState.editOrder)
    }
    private getOrderFactoryIncentive(order: IOrder) : number {
        return _.sum(
            order
                .OrderDiscounts
                .filter(d => !d.DiscountTypeID)
                .map(d => d.DiscountAmount))
    }
    private getDealerDiscount(rootConfiguration: IConfiguration): number {
        if (this.appState.editOrder) {
            return _.sum(
                this.appState
                    .editOrder
                    .OrderDiscounts
                    .filter(d => d.DiscountTypeID)
                    .map(d => d.DiscountAmount))
        }
        let dealer = this.DealerList ? this.DealerList.find(d => d.ID === this.appState.CurrentUser.DealerID) : null
        return (
            this.appState.selectedProgram &&
            dealer &&
            dealer.DealerDiscounts &&
            dealer.DealerDiscounts[this.appState.selectedProgram.DiscountTypeName])
                ? dealer.DealerDiscounts[this.appState.selectedProgram.DiscountTypeName][rootConfiguration.RootSpecification.Metadata[this.discountMetadataKey]]
                : 0
    }
    private loadSurchargeTypes() {
        let tmpSubscription: Subscription =
            this.surchargeService
                .getSurchargeTypes()
                .subscribe(surchargeTypes => this.surchargeTypes = surchargeTypes,
                    () => this.toastr.error('Error while loading surchage types.', 'Error'),
                    () => tmpSubscription.unsubscribe())
    }
}