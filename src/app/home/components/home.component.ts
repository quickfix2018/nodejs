import { Component, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { SpecificationService, ISpecification, SelectionArgs } from '../../specification'
import { ApplicationState, DiagnosticService } from '../../_shared'
import { ApplicationSettingService } from '../../application-setting'
import { AuthService } from '../../auth'
import { PricingService, IDealerPriceLevel } from '../../pricing'
import { IDiscount, DiscountService, asLookup } from '../../discount'
import { ModalDirective } from 'ngx-bootstrap/modal'

@Component({
    moduleId: module.id,
    templateUrl: "./home.component.html",
    styleUrls: ['./home.component.css'],
    providers: [SpecificationService, DiscountService]
})
export class HomeComponent {
    @ViewChild('programModal') public programModal: ModalDirective
    public specByYear: { [key: string]: ISpecification[] } = {}
    specifications$ = this
        .settingService
        .applicationSetting$
        .filter(setting => setting !== null)
        .map(setting => setting['ModelYear'])
        .switchMap(year => this
            .specificationService
            .getBySpecificationTypeNameAndDepth('Model')
            .map(ss => ss
                .filter(s => !!s)
                .filter(s =>
                    (this.isAdm(this.appState.CurrentUser.Email)) ?
                    s.Metadata['ui.designer.model.year'] === year || +s.Metadata['ui.designer.model.year'] === +year + 1 :
                    s.Metadata['ui.designer.model.year'] === year)
                .reduce((lookup, curr) => {
                    const year = curr.Metadata['ui.designer.model.year']
                    const models = lookup[year] || []
                    models.push(curr)
                    lookup[year] = models

                    return lookup
                }, (<{ [key: string]: ISpecification[] }>{}))))

    years$ = this
        .specifications$
        .map(s => Object.keys(s))

    private isAdm(user: string) {
        return user === 'sophcon' || user === 'dustin' || user === 'blake'
    }

    public lookupByYear$(year: string) {
        return this
            .specifications$
            .map(s => s[year]);
    }

    public availablePrograms: { [Key: string]: { [priceLevel: number]: IDiscount[] } }
    public availableDealers: IDealerPriceLevel[]
    public selectedProgramKey: string
    public selectedProgram: IDiscount
    public showPrograms: boolean
    private selectedSpecification: ISpecification
    constructor(
        public settingService: ApplicationSettingService,
        public appState: ApplicationState,
        private router: Router,
        private specificationService: SpecificationService,
        private discountService: DiscountService,
        private auth: AuthService,
        private priceService: PricingService,
        private diag: DiagnosticService
    ) { }

    ngOnInit() {
        this.specifications$
            .first()
            .subscribe((s) => this.specByYear = s)

        this.appState.selectedProgram = null
        this.availablePrograms = {}
        this.appState.resetImpersonation()
        this.showPrograms = false
        this.appState.editOrder = null

        if (this.appState.configuration) {
            this.appState.resetConfiguration()
        }
        if (this.auth.isLoggedIn()) {
            asLookup(this.discountService.getDiscount())
                .subscribe(discounts => this.availablePrograms = discounts)
            if (this.appState.CurrentUser.IsAdmin) {
                this.getPricingLevels()
            }
        }
    }
    specificationSelectedEventHandler(arg: SelectionArgs) {
        this.selectedProgramKey = arg.specification.Metadata["domain.mb.rebate.key"]
        if (this.appState.CurrentUser.Dealer && !!this.availablePrograms[this.selectedProgramKey][this.appState.CurrentUser.PriceLevel]) {
            this.selectedSpecification = arg.specification
            this.showPrograms = !!this.availablePrograms[this.selectedProgramKey] && !!this.availablePrograms[this.selectedProgramKey][this.appState.CurrentUser.PriceLevel] && this.availablePrograms[this.selectedProgramKey][this.appState.CurrentUser.PriceLevel].length > 0
            this.programModal.show()
        } else {
            this.router.navigate(['/model', arg.specification.ID])
        }
    }
    createOrderClickedHandler() {
        this.appState.selectedProgram = this.showPrograms ? this.selectedProgram : null
        this.router.navigate(['/model', this.selectedSpecification.ID])
    }
    getPricingLevels() {
        this.priceService.getDealerPricingLevels().subscribe(
            pricingLevels => this.availableDealers = pricingLevels,
            error => {
                this.diag.logError('Error getting dealer price levels', HomeComponent.name)
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