import { Component, OnInit, ViewChild } from '@angular/core'
import { Router } from '@angular/router'
import { AllRoutes } from '../app.routes'
import { ApplicationState, DiagnosticService } from '../_shared'
import { AuthService } from '../auth'
import { PricingService, IDealerPriceLevel } from '../pricing'
import { ModalDirective } from 'ngx-bootstrap/modal'
import { ToastsManager } from 'ng2-toastr/src/toast-manager'
import { ApplicationSettingService, IApplicationSetting } from '../application-setting'
import { NotificationClientService } from '../notiification'
import { Observable } from 'rxjs/Observable'
import { AdminAuthGuard } from '../auth/admin-auth.guard'
import * as moment from 'moment'

@Component({
    moduleId: module.id,
    selector: 'top-navigation',
    templateUrl: 'top-navigation.component.html',
})
export class TopNavigationComponent implements OnInit {
    @ViewChild('changePricingLevels') public changePricingLevels: ModalDirective;
    navigationItems: any[]
    collapsed: boolean
    public retailBaseUrl$: Observable<string>
    public selectedDealerID: string
    public dealerPriceLevels: IDealerPriceLevel[]
    public get authNavItems(): any[] {
        const filterPaths = ['logout', 'config/:configurationID', 'dealer/projections/2019', 'dealer/contract', 'account/change-password' ]
        const all = AllRoutes
            .filter(r => r.canActivate.length > 0)
            .filter(r => !filterPaths.some(p => p === r.path))

        const auth = all.filter(r => !(<any[]>r.canActivate).some(g => g === AdminAuthGuard))

        return this.appState.CurrentUser.IsAdmin ? all : auth
    }
    constructor(
        private router: Router,
        public appState: ApplicationState,
        public auth: AuthService,
        private priceService: PricingService,
        private diag: DiagnosticService,
        private toastr: ToastsManager,
        public appSettingService: ApplicationSettingService,
    ) { }

    ngOnInit() {
        this.retailBaseUrl$ = this.appSettingService
            .applicationSetting$
            .filter(setting => setting !== null)
            .map(setting => setting['RetailBaseUrl'])
        this.navigationItems = AllRoutes.filter(r => !r.parentName);

        this.collapsed = true
        if (this.auth.isLoggedIn()) {
            this.getPricingLevels()
        }
    }
    logout() {
        //this.auth.redirectUrl = this.appState.CurrentRouteData.url
        //this.router.navigate(['/logout'])
        this.auth.logout();
        this.toggleNavigation()
    }
    login() {
        this.auth.redirectUrl = this.appState.CurrentRouteData.url
        this.router.navigate(['/login'])
        this.toggleNavigation()
    }
    toggleNavigation() {
        this.collapsed = !this.collapsed
    }
    setPricingLevel() {
        const dealerPricingLevel = this.dealerPriceLevels.find(d => d.DealerID === +this.selectedDealerID)
        if (dealerPricingLevel) {
            this.appState.setImpersonation(dealerPricingLevel.PriceLevel, dealerPricingLevel.DealerID, dealerPricingLevel.Name)
            this.diag.logInformation(`Current User PriceLevel: ${this.appState.CurrentUser.PriceLevel}`, TopNavigationComponent.name)
            this.toastr.success(`You are now impersonating ${dealerPricingLevel.Name}.`, 'Picing Level Set')
        } else {
            this.toastr.error('The pricing level was not set, please try again.', 'Error Setting Picing Level')
        }

        this.changePricingLevels.hide()
    }
    getPricingLevels() {
        this.priceService.getDealerPricingLevels().subscribe(
            pricingLevels => this.dealerPriceLevels = pricingLevels,
            error => {
                this.diag.logError('Error getting dealer price levels', TopNavigationComponent.name)
            })
    }
    openDealerImpersonantionModal() {
        if (this.appState.configuration && this.appState.configuration.ID > 0) {
            this.toastr.warning('Impersonantion has been disabled when editing an exsting boat.')
            return
        }
        this.selectedDealerID = this.appState.CurrentUser.DealerID.toString()
        if (!this.dealerPriceLevels) {
            this.getPricingLevels()
        }
        this.changePricingLevels.show()
    }
}
