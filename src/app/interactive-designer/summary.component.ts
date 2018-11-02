import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute, Router, Params, RoutesRecognized, ActivatedRouteSnapshot } from '@angular/router'
import { ConfigurationService, linkConfigurationFromRootSpec } from '../configuration'
import { IConfiguration, IConfigurationItem } from '../configuration/iconfiguration'
import { ISpecification } from '../specification'
import { OrderService, IOrder } from '../order'
import { AuthService } from '../auth'
import { DiagnosticService, ApplicationState, flattenArray, CalculationService, TotalSummary } from '../_shared'
import { ApplicationSettingService } from '../application-setting'
import { ToastsManager } from 'ng2-toastr/src/toast-manager'
import { Observable, Subscription } from 'rxjs/Rx'
import { ModalDirective } from 'ngx-bootstrap/modal'
import { DiscountService, IDiscount } from '../discount'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/mergeMap'
import { trailerFilter } from '../configuration/mb-helpers';

export interface ConfigurationItemsGroup {
    [Key: string]: IConfigurationItem[]
}

@Component({
    moduleId: module.id,
    selector: 'cwd-summary',
    templateUrl: 'summary.component.html',
    styleUrls: ['summary.component.css'],
    providers: [OrderService, DiscountService]
})
export class SummaryComponent implements OnInit {
    @Input() configuration: IConfiguration
    @Input() specification: ISpecification
    validatedConfiguration: ConfigurationItemsGroup
    configDictionary: { [Key: number]: IConfigurationItem }
    savedConfigurationID: number
    order: IOrder
    orderID: number = 0
    public enableSave: boolean
    public availablePrograms: IDiscount[]
    public selectedDiscountTypeID: string
    public isoCurrencyCode$: Observable<string>
    public retailBaseUrl$: Observable<string>
    @ViewChild('savedBoatNotification') public savedBoatNotification: ModalDirective;
    @ViewChild('saveOrderModal') public saveOrderModal: ModalDirective;

    constructor(
        public appState: ApplicationState,
        public auth: AuthService,
        public calcService: CalculationService,
        public settingService: ApplicationSettingService,
        private router: Router,
        private orderService: OrderService,
        private configService: ConfigurationService,
        private diag: DiagnosticService,
        private toastsManager: ToastsManager,
        private discountService: DiscountService
    ) { }
    ngOnInit() {
        this.savedConfigurationID = 0
        this.enableSave = true
        this.validateConfiguration(this.configuration)
        this.configDictionary = {}
        this.isoCurrencyCode$ =
            this.settingService
                .applicationSetting$
                .filter(setting => setting !== null)
                .map(setting => setting['IsoCurrencyFormat'])
        this.retailBaseUrl$ =
            this.settingService
                .applicationSetting$
                .filter(setting => setting !== null)
                .map(setting => setting['RetailBaseUrl'])
        this.configuration
            .Items
            .forEach(c => {
                this.configDictionary[c.KeySpecificationID] = c
            });
        if (this.auth.isLoggedIn()) {
            this.discountService
                .getDealerModelDiscount(this.configuration.RootSpecification.Metadata["domain.mb.rebate.key"], this.appState.CurrentUser.DealerID)
                .subscribe(discounts => {
                    this.availablePrograms = discounts
                })
        }
    }
    attributeSummary = (configurationItem: IConfigurationItem) => {
        const data = JSON.parse(configurationItem.InputValue) as any[]

        return data
            .map(attr => `(${attr.displayName})`)
            .join(' ')
    }
    validateConfiguration(configurationToValidate: IConfiguration) {
        this.configService
            .validate(configurationToValidate)
            .do(c => linkConfigurationFromRootSpec(([this.specification, c])))
            .map(c => c.Items)
            .map(items => items
                .reduce((prev, curr) => {
                    const key = this.getCategoryFromConfigurationItem(curr)
                    const entries = prev[key] || []
                    entries.push(curr)
                    prev[key] = entries
                    return prev
                },
                <ConfigurationItemsGroup>{}))
            .subscribe(config =>
                this.validatedConfiguration = config)
    }
    private getCategoryFromConfigurationItem(configItem: IConfigurationItem) {
        if (configItem.ValueSpecification && trailerFilter(configItem)) {
            return 'Trailer'
        }

        if (configItem.KeySpecification.SpecificationTypeSystemName === 'ColorArea') {
            if (configItem.KeyDisplayName.startsWith('Gel') || configItem.KeyDisplayName === 'Swimstep') {
                return 'Gelcoat'
            } else {
                return 'Upholstery'
            }
        }

        return 'Options'
    }
    openConfirmSave() {
        if (this.hasValidationError()) {
            return
        }

        this.saveOrderModal.show()
    }
    saveOrderEventHandler() {
        this.enableSave = false
        if (this.hasValidationError()) {
            return
        }

        let selectedDiscount = this.appState.selectedProgram

        if (this.availablePrograms && this.availablePrograms.length > 0 && !selectedDiscount) {
            this.toastsManager.error('Please select a program before proceeding.', 'Error')
            return
        }
        this.saveOrderModal.hide()

        this.savedBoatNotification.show()
        if (this.appState.editOrder) {
            var order = this.appState.editOrder
            if (selectedDiscount) {
                let dealerDiscount = order.OrderDiscounts.find(d => this.availablePrograms.some(p => p.DiscountTypeID === d.DiscountTypeID))
                if (!dealerDiscount) {
                    dealerDiscount = {
                        ID: 0,
                        Description: selectedDiscount.DiscountTypeName,
                        OrderID: order.ID,
                        DiscountAmount: selectedDiscount.Amount,
                        DiscountTypeID: selectedDiscount.DiscountTypeID,
                        DiscountTypeName: selectedDiscount.DiscountTypeName
                    }
                    order.OrderDiscounts.push(dealerDiscount)
                }
                dealerDiscount.Description = selectedDiscount.DiscountTypeName
                dealerDiscount.DiscountAmount = selectedDiscount.Amount
                dealerDiscount.DiscountTypeID = selectedDiscount.DiscountTypeID
                dealerDiscount.DiscountTypeName = selectedDiscount.DiscountTypeName
            }
            this.configService
                .updateConfiguration(this.configuration)
                .subscribe((config: IConfiguration) =>
                    this.orderService
                        .updateOrder(order)
                        .subscribe((order: IOrder) => {
                            this.savedConfigurationID = order.ConfigurationID
                            this.appState.resetConfiguration()
                            this.appState.editOrder = null
                            this.orderID = order.ID
                            this.appState.resetConfiguration()
                            this.appState.selectedProgram = null
                        }, error => {
                            let errMsg = error || 'There was an error while saving your boat, please try again.'
                            this.toastsManager.error(errMsg, 'Error')
                            this.savedBoatNotification.hide()
                        }), error => {
                            let errMsg = error || 'There was an error while saving your boat, please try again.'
                            this.toastsManager.error(errMsg, 'Error')
                            this.savedBoatNotification.hide()
                        })
        } else {
            this.configService.addConfiguration(this.configuration)
                .flatMap((config: IConfiguration) => this.orderService.addOrder(config.ID, selectedDiscount))
                .subscribe(order => {
                    this.savedConfigurationID = order.ConfigurationID
                    this.appState.resetConfiguration()
                    this.orderID = order.ID
                    this.appState.resetConfiguration()
                    this.appState.selectedProgram = null
                },
                error => {
                    let errMsg = error || 'There was an error while saving your boat, please try again.'
                    this.toastsManager.error(errMsg, 'Error')
                    this.savedBoatNotification.hide()
                },
                () => {
                    this.enableSave = true
                })
        }
    }
    getConfigMetadata(keyID: number, key: string): string {
        if (this.configDictionary[keyID] && this.configDictionary[keyID].ValueSpecification.Metadata) {
            return this.configDictionary[keyID].ValueSpecification.Metadata[key]
        }
        return ''
    }
    printRetail() {
        if (this.savedConfigurationID < 1) {
            if (this.configuration.ID > 0) {
                // save then redirect to print
                this.configService
                    .updateConfiguration(this.configuration)
                    .subscribe(config => {
                        this.savedConfigurationID = config.ID
                        this.configuration = config
                        window.open(`/print/Retail/${config.ID}/${this.appState.CurrentUser.DealerID || ''}`, '_newtab')
                    })
            } else {
                // save then redirect to print
                this.configService
                    .addConfiguration(this.configuration)
                    .subscribe(config => {
                        this.savedConfigurationID = config.ID
                        this.configuration = config
                        window.open(`/print/Retail/${config.ID}/${this.appState.CurrentUser.DealerID || ''}`, '_newtab')
                    })
            }
        } else {
            window.open(`/print/Retail/${this.savedConfigurationID}/${this.appState.CurrentUser.DealerID || ''}`, '_newtab')
        }
    }
    printOrder() {
        window.open(`print/modelpricing/${this.orderID}`, '_modelPricing', '', false)
    }
    programChanged(program: IDiscount) {
        this.appState.selectedProgram = program
        this.calcService.calculateTotal(this.configuration)
    }

    private hasValidationError() : boolean {
        let validationMsgs = Object.keys(this.validatedConfiguration)
            .filter(key => this.validatedConfiguration[key].some(item => item.HasError))
            .map(key => `Please provide a ${key === 'Options' ? 'selection' : 'color'} for all ${key} before saving.`)

        validationMsgs
            .forEach(msg => this.toastsManager.error(msg, 'Validation Error'))

        return validationMsgs.length > 0
    }
}