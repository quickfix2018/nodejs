import { Component, OnInit, OnDestroy, EventEmitter, ViewChild } from '@angular/core'
import { ActivatedRoute, Router, Params, RoutesRecognized, ActivatedRouteSnapshot } from '@angular/router'
import { ConfigurationService, IConfiguration, linkConfigurationFromRootSpec } from '../../configuration'
import { SpecificationService, ISpecification, SpecificationEventArgs, ChoiceArgs, MultiSelectArgs, SelectionArgs } from '../../specification'
import { DiagnosticService, ApplicationState, ResponsiveHelper, BootstrapObj, CalculationService, TotalSummary } from '../../_shared'
import { flattenArray } from '../../_shared/util'
import { Observable, Subscription } from 'rxjs/Rx'
import { PricingService, IDealerPriceLevel } from '../../pricing'
import { IDiscount, DiscountService, asLookup } from '../../discount'
import { SurchargeService, ISurchargeType, ISurchargeTypeCounter } from '../../surcharge'
import { ApplicationSettingService } from '../../application-setting'
import { AuthService } from '../../auth'
import { DealerClientService } from '../../dealer'
import { ModalDirective } from 'ngx-bootstrap/modal'
import { ToastsManager } from 'ng2-toastr/src/toast-manager'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/mergeMap'
import 'lodash'
declare var _: any;

@Component({
    moduleId: module.id,
    templateUrl: 'main-layout.component.html',
    providers: [DiscountService, PricingService, SurchargeService, CalculationService, DealerClientService],
    styleUrls: ['main-layout.component.css']
})
export class MainLayoutComponent extends ResponsiveHelper implements OnInit, OnDestroy {
    @ViewChild('programModal') public programModal: ModalDirective
    rootSpecificationID: number
    specification: ISpecification
    selectedSpecification: ISpecification
    configuration: IConfiguration
    routeSub: Subscription
    showSummary: boolean
    configurationID: number
    configuration$: Observable<IConfiguration>
    view: string = "Exterior"
    nextSpecName: string = ""
    loadingConfig: boolean
    optionsTotal: number = 0.0
    runningTotal: number = 0.0
    basePrice: number = 0.0
    private surchargeTypeCodes: string[]
    private surchargeTypes: ISurchargeType[]
    private configurationChangedEmitter: EventEmitter<IConfiguration>
    public isoCurrencyCode$: Observable<string>
    public get currentIndex(): number {
        return !!this.specification && !!this.selectedSpecification ? this.specification.Children.indexOf(this.selectedSpecification) : -1
    }
    public get showNext(): boolean {
        return this.currentIndex !== -1
    }
    public get showPrev(): boolean {
        return this.currentIndex === -1 || this.currentIndex > 0
    }
    public currentNavigation: string = "";
    public bootstrapObj: BootstrapObj

    public availablePrograms: { [Key: string]: { [priceLevelID: string]: IDiscount[] } }
    public availableDealers: IDealerPriceLevel[]
    public selectedProgramKey: string
    public selectedProgram: IDiscount
    public showPrograms: boolean
    public totalSummary: TotalSummary
    constructor(
        public appState: ApplicationState,
        public settingService: ApplicationSettingService,
        private specificationService: SpecificationService,
        private configurationService: ConfigurationService,
        private router: Router,
        private route: ActivatedRoute,
        private diag: DiagnosticService,
        private discountService: DiscountService,
        private priceService: PricingService,
        private auth: AuthService,
        private surchargeService: SurchargeService,
        private toastr: ToastsManager,
        private calcService: CalculationService,
    ) {
        super()
        this.bootStrapObj$.subscribe(obj => this.bootstrapObj = obj)
        this.loadingConfig = false
    }

    ngOnInit() {
        this.availablePrograms = {}
        this.showPrograms = false
        this.isoCurrencyCode$ =
            this.settingService
                .applicationSetting$
                .filter(setting => setting !== null)
                .map(setting => setting['IsoCurrencyFormat'])
        //this.diag.logVerbose('Executing ngOninit().', `${MainLayoutComponent.name}.ngOnChanges()`)
        this.view = "Exterior"
        this.routeSub = this.route.params
            .filter(params => !!params['configurationID'] || !!params['id'])
            .subscribe(params => {
                if (!!params['configurationID']) {
                    this.loadingConfig = true
                    this.loadConfiguration(+params['configurationID'])
                } else if (!!params['id']) {
                    if (!this.appState && !this.appState.configuration && this.appState.configuration.RootSpecificationID !== +params['id']) {
                        this.appState.resetConfiguration()
                    }
                    this.specificationService
                        .getByID(+params['id'])
                        .subscribe(spec => {
                            if (this.appState.configuration === null || (this.appState.configuration && this.appState.configuration.ID < 1 && this.appState.configuration.RootSpecificationID !== spec.ID)) {
                                this.appState.addRootConfiguration(spec)
                            }
                            if (this.appState.configuration.RootSpecificationID === spec.ID) {
                                this.appState.udpateConfigurationPricing(spec)
                            }
                            this.configuration = this.appState.configuration
                            this.setSpecification(spec)
                        })
                }
            },
            error => this.diag.logError('Error getting parameters.', `${MainLayoutComponent.name}.ngOnInit()`))
        this.loadSurcharges()
        this.configurationChangedEmitter = this.appState
            .onConfigurationChanged
            .subscribe((c: IConfiguration) => {
                if (!this.loadingConfig) {
                    this.configuration = c || this.configuration
                    if (this.configuration) {
                        this.loadSpecification(this.configuration.RootSpecificationID)
                    }
                }
            })

        if (this.auth.isLoggedIn()) {
            asLookup(this.discountService.getDiscount())
                .subscribe(discounts => {
                    this.availablePrograms = discounts
                    this.loadProgram(this.specification)
                })
            if (this.appState.CurrentUser.IsAdmin) {
                this.getPricingLevels()
            }
        }
        this.calcService.onTotalChangedEvent.subscribe((totalSummaryObj: TotalSummary) => this.totalSummary = totalSummaryObj)
    }
    ngOnDestroy() {
        this.diag.logVerbose(`${MainLayoutComponent.name}.ngOnDestroy()`, MainLayoutComponent.name)
        if (this.routeSub) this.routeSub.unsubscribe()
        if (this.configurationChangedEmitter) this.configurationChangedEmitter.unsubscribe()
    }
    loadSpecification(specificationID: number) {
        if (this.specification && this.specification.ID === specificationID) return
        this.diag.logInformation(`Loading Specification for ID: ${specificationID}.`, MainLayoutComponent.name)
        this.specificationService.getByID(specificationID).subscribe(
            spec => this.setSpecification(spec),
            error => this.diag.logError(`Error calling specificationService.specificationByID`, `${MainLayoutComponent.name}.loadSpecification()`))
    }
    loadConfiguration(configurationID: number) {
        this.diag.logInformation(`Loading Configuration for ID: ${configurationID}.`, `${MainLayoutComponent.name}.loadConfiguration()`)
        this
            .configurationService
            .getConfigurationByID(configurationID)
            .switchMap(config => this.specificationService.getByID(config.RootSpecificationID),
                (config, spec) => {
                    this.configuration = linkConfigurationFromRootSpec([spec, config])
                    this.appState.configuration = this.configuration
                    this.setSpecification(spec)
                })
            .subscribe(
                spec => this.diag.logInformation('Found a root Specification'),
                error => this.diag.logError(`Error loading configurations and root specification.`, `${MainLayoutComponent.name}.loadConfiguration()`))
    }
    loadSurcharges() {
        this.surchargeTypes = []
        this.surchargeTypeCodes = []
        let s: Subscription = this.surchargeService
            .getSurchargeTypes()
            .subscribe(
                surchargeTypes => surchargeTypes.forEach(sType => {
                    if (!this.surchargeTypeCodes.some(st => st === sType.Code)) {
                        this.surchargeTypeCodes.push(sType.Code)
                    }
                    this.surchargeTypes.push(sType)
                }),
                error => {
                    this.diag.logError(error, `${MainLayoutComponent.name}.loadSurcharges()`)
                    this.toastr.error('There was an error while fetching system data, please refresh your browser and try again.', 'Error')
                },
                () => s.unsubscribe())
    }
    handleSpecificationSelected(arg: SpecificationEventArgs) {
        if (arg instanceof ChoiceArgs) {
            this.configuration = this.appState.updateChoice(this.selectedSpecification, arg.choiceSpecification, arg.selectionSpecification);
        } else if (arg instanceof MultiSelectArgs) {
            this.configuration = this.appState.updateMultiChoice(this.selectedSpecification, arg.choiceSpecification, arg.selectionSpecification, arg.attributeData)
        } else if (arg instanceof SelectionArgs) {
            arg.specification.Selected = !arg.specification.Selected
            this.configuration = this.appState.updateMultiChoice(this.selectedSpecification, this.selectedSpecification, arg.specification, arg.attributeData)
        }
    }
    handleNavigationClicked(specification: ISpecification) {
        this.selectedSpecification = specification
        this.showSummary = !this.selectedSpecification
        if (!!specification) {
            let nextIndex = this.specification.Children.indexOf(this.selectedSpecification) + 1

            this.nextSpecName = nextIndex > this.specification.Children.length ? ""
                : nextIndex === this.specification.Children.length ? "Summary"
                    : this.specification.Children[nextIndex].DisplayName
            this.currentNavigation = specification.DisplayName
        }
    }
    handleNextButtonClicked() {
        let prevIndex = this.specification.Children.indexOf(this.selectedSpecification)
        let currIndex = prevIndex + 1
        let nextIndex = currIndex + 1
        this.handleNavigationClicked(this.specification.Children[currIndex]);
    }
    handleBackButtonClicked() {
        let prevIndex = !!this.selectedSpecification ? this.specification.Children.indexOf(this.selectedSpecification) : this.specification.Children.length
        let currIndex = prevIndex - 1
        let nextIndex = currIndex + 1
        this.handleNavigationClicked(currIndex > -1 ? this.specification.Children[currIndex] : null);
    }

    private setSpecification(spec: ISpecification): void {
        this.specification = spec
        this.rootSpecificationID = spec.ID
        this.specification.Children.sort((a, b) => a.Order > b.Order ? 1 : a.Order < b.Order ? -1 : 0)
        this.selectedSpecification = spec.Children[0]
        this.nextSpecName = spec.Children[1].DisplayName
        this.loadProgram(spec)
        this.appState.cacheConfiguration()
        this.diag.logVerbose('Specification Loaded', `${MainLayoutComponent.name}.loadSpecification()`)
    }

    private loadProgram(specification: ISpecification) {
        if (!this.auth.isLoggedIn() || !this.availablePrograms || !specification) return

        this.selectedProgramKey = specification.Metadata["domain.mb.rebate.key"]
        this.showPrograms = (this.appState.CurrentUser.IsAdmin && this.appState.CurrentUser.PriceLevel < 0) || (!!this.availablePrograms[this.selectedProgramKey] && this.availablePrograms[this.selectedProgramKey][this.appState.CurrentUser.PriceLevel] && this.availablePrograms[this.selectedProgramKey][this.appState.CurrentUser.PriceLevel].length > 0)
        if (!this.appState.selectedProgram && this.showPrograms) {
            this.programModal.show()
        }
    }

    contuneConfigurationClicked() {
        this.appState.selectedProgram = this.showPrograms ? this.selectedProgram : null
        this.programModal.hide()
    }
    getPricingLevels() {
        this.priceService.getDealerPricingLevels().subscribe(
            pricingLevels => this.availableDealers = pricingLevels,
            error => {
                this.diag.logError('Error getting dealer price levels', MainLayoutComponent.name)
            })
    }
    selectedDealerChanged(dealerID: string) {
        let dealer = this.availableDealers.find(d => d.DealerID === +dealerID)
        this.showPrograms = !!this.availablePrograms[this.selectedProgramKey] && !!this.availablePrograms[this.selectedProgramKey][dealer.PriceLevel] && this.availablePrograms[this.selectedProgramKey][dealer.PriceLevel].length > 0

        if (dealer && this.appState.CurrentUser.DealerID !== dealer.DealerID) {
            this.appState.setImpersonation(dealer.PriceLevel, dealer.DealerID, dealer.Name)
        }
    }
}