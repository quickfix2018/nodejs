import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpModule, RequestOptions } from '@angular/http'

import { AppComponent } from './app.component'
import { routing } from './app.routes'

import { ToastModule } from 'ng2-toastr/src/toast.module'
import { ToastOptions } from 'ng2-toastr'
import { CustomOptions } from './_shared/toastr-options'

import { PdfViewerModule } from 'ng2-pdf-viewer'

import { DragDropModule } from 'primeng/primeng'

//import { ResponsiveModule } from 'ng2-responsive'
import { InfiniteScrollerModule } from './ng-infinite-scroller/infinite-scroller.module'
import { FlowSchedulerModule } from './ng-flowscheduler/flowscheduler.module';
import { ModalModule } from 'ngx-bootstrap/modal'
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { AccordionModule } from 'ngx-bootstrap/accordion'
import { BsDropdownModule } from 'ngx-bootstrap/dropdown'
import { PopoverModule } from 'ngx-bootstrap/popover'

import { TopNavigationComponent } from './navigation'
import {
    NotificationClientService,
    NotificationService,
    NotificationMenuComponent,
} from './notiification'
import {
    SpecificationItemNavigationComponent,
    SpecificationDisplayComponent,
    SpecificationItemComponent,
    SpecificationChoiceGroupComponent,
    SpecificationStackPanelComponent,
    SpecificationGroupComponent,
    SpecificationItemChoiceComponent,
    SpecificationItemMultiChoiceComponent,
    SpecificationItemAttributeFeatureComponent,
    SpecificationMetadataFilter,
    SpecificationOptionsComponent,
} from './specification';
import { SpecificationService } from './specification/services/specification.service'
import { HomeComponent } from './home'
import {
    LoginComponent,
    ChangePasswordComponent,
    LogoutComponent,
    ProfilePageComponent
} from './account'
import {
    ConfigurationSvgRenderer,
    ConfigurationSvg,
    ConfigurationService,
    ConfigurationSort
} from './configuration';
import { MainLayoutComponent, SummaryComponent } from './interactive-designer'
import {
    OrderComponent,
    OrderFormComponent,
    OrderNotesComponent,
    OrderNotesModalComponent,
    ScheduleSprayDatesComponent,
    PolicyClientService
} from './order'
import { PricingService } from './pricing'
import { DiagnosticService, ApplicationState, DefaultRequestOptions, KeysPipe } from './_shared';
import { AuthService, AuthGuard, AdminAuthGuard, DealerPolicyGuard, NoAccessComponent } from './auth'
import { ApplicationSettingService } from './application-setting/services/application-setting.service'
import { Notification } from 'rxjs/Notification';
import {
    DealerClientService,
    DealerContractComponent,
    DealerProjectionsComponent,
    ManageDealerListComponent,
    ManageDealerCardComponent,
    ManageDealerPageComponent,
    DealerProjectionsPageComponent
} from './dealer'
import { PolicySummaryComponent } from './policy';


@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        TopNavigationComponent,
        NotificationMenuComponent,
        SpecificationItemNavigationComponent,
        SpecificationDisplayComponent,
        SpecificationItemComponent,
        SpecificationChoiceGroupComponent,
        SpecificationStackPanelComponent,
        SpecificationGroupComponent,
        SpecificationItemChoiceComponent,
        SpecificationItemMultiChoiceComponent,
        SpecificationItemAttributeFeatureComponent,
        SpecificationOptionsComponent,
        ConfigurationSvgRenderer,
        ConfigurationSvg,
        ConfigurationSort,
        MainLayoutComponent,
        SummaryComponent,

        OrderComponent,
        OrderFormComponent,
        OrderNotesComponent,
        OrderNotesModalComponent,
        ScheduleSprayDatesComponent,

        LoginComponent,
        ChangePasswordComponent,
        LogoutComponent,
        ProfilePageComponent,

        DealerContractComponent,
        DealerProjectionsComponent,
        DealerProjectionsPageComponent,
        ManageDealerListComponent,
        ManageDealerCardComponent,
        ManageDealerPageComponent,

        PolicySummaryComponent,

        SpecificationMetadataFilter,
        NoAccessComponent,
        KeysPipe,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        CommonModule,
        FormsModule,
        HttpModule,
        routing,
        InfiniteScrollerModule,
        FlowSchedulerModule,
        ToastModule.forRoot(),
        PdfViewerModule,
        //ResponsiveModule,
        ModalModule.forRoot(),
        TooltipModule.forRoot(),
        AccordionModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
    ],
    providers: [
        DiagnosticService,
        ApplicationSettingService,
        ApplicationState,
        NotificationClientService,
        NotificationService,
        ConfigurationService,
        SpecificationService,
        PolicyClientService,
        AuthService,
        PricingService,
        DealerClientService,
        AuthGuard,
        AdminAuthGuard,
        DealerPolicyGuard,
        { provide: RequestOptions, useClass: DefaultRequestOptions },
        { provide: ToastOptions, useClass: CustomOptions }
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule { }
