import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, ViewChild, OnDestroy, Inject, forwardRef } from '@angular/core'
import { ISpecification } from '../specification'
import { ChoiceArgs, SelectionArgs } from '../event-args'
import { IConfiguration, ConfigurationService } from '../../configuration'
import { ISpecificationMetadata } from '../../specification-metadata'
import { SpecificationDisplayComponent } from '../specification-display/specification-display.component'
import { DiagnosticService, flattenArray, ApplicationState } from '../../_shared'
import { ResponsiveHelper } from '../../_shared/util'
import { ModalDirective } from 'ngx-bootstrap/modal'
import { ApplicationSettingService } from '../../application-setting'
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/debounce';
import {Observable, Observer, Subscription} from  'rxjs/Rx';

export interface ISpecificationMetadataDictionary {
    [metadataKey: string]: string
}

@Component({
    moduleId: module.id,
    selector: 'cwd-specification-item-choice',
    templateUrl: 'specification-item-choice.component.html',
    styleUrls: ['specification-item-choice.component.css']
})
export class SpecificationItemChoiceComponent extends ResponsiveHelper implements OnInit, OnChanges, OnDestroy {
    @Input() specification: ISpecification
    @Input() configuration: IConfiguration
    @Output() choiceSpecificationSelected = new EventEmitter()
    choiceSpecification: ISpecification
    specificationMetadata: { [key: number]: ISpecificationMetadataDictionary }
    accordionActive: boolean
    componentName: string
    size: string
    private _configurationSub: Subscription

    @ViewChild('colorPalletModal') public colorPalletModal: ModalDirective;
    @ViewChild('featureGroupModal') public featureGroupModal: ModalDirective;

    public isoCurrencyCode$: Observable<string>
    public featureGroupTypes: string[] = ['Flooring', 'Engine', 'Speakers', 'Propeller', 'FeatureGroup' ]
    public displayName: string = ""
    public price: number = 0
    public imgUrl: string = ""
    public tooltip: string = ""
    public hasDefault = false

    get selectedChild() {
        return this.specification.Children.find(c => c.Selected)
    }

    constructor(
        public settingService: ApplicationSettingService,
        private diag: DiagnosticService,
        @Inject(forwardRef(() => ApplicationState)) private appState: ApplicationState,
    ) {
        super()
        this.bootStrapObj$.subscribe(obj => this.size = obj.Size)
        this.accordionActive = false
        this.specificationMetadata = {}
    }

    ngOnInit() {
        this.isoCurrencyCode$ =
            this.settingService
                .applicationSetting$
                .filter(setting => setting !== null)
                .map(setting => setting['IsoCurrencyFormat'])
        this.diag.logVerbose('Executing ngOninit().', `${SpecificationItemChoiceComponent.name}.ngOnChanges()`)
        this.diag.logVerbose(`Subscribed to configurationService.configuration$`, `${SpecificationItemChoiceComponent.name}.ngOnChanges()`)
        if (this.specification.Selected) {
            this.setDisplay(this.specification.Metadata['ui.designer.displayname'], this.specification.Pricing[this.appState.CurrentUser.PriceLevel], this.specification.Metadata['ui.designer.feature.image.source'], this.specification.Metadata['ui.designer.tooltip'])
        } else {
            this.resetDisplay()
        }
        this._configurationSub =
            this.appState
                .configuration$
                .subscribe(config => this.buildMetadata(config, flattenArray(this.specification, s => s.Children)))
        this.hasDefault = this.specification.Children.some(c => !!c.Metadata["ui.designer.default"] && c.Metadata["ui.designer.default"].toLowerCase() === 'true')
    }
    ngOnChanges(changes: SimpleChanges) {
        if (changes['specification'] && changes['specification'].currentValue !== changes['specification'].previousValue) {
            this.diag.logVerbose(`Property specification { ID: ${changes['specification'].currentValue.ID}, DisplayName: ${changes['specification'].currentValue.DisplayName} changed.`, `${SpecificationItemChoiceComponent.name}.ngOnChanges()`)
            if (this.specification && this.specification.Children) {
                if(this.size !== 'xs') {
                    this.on_choiceSpecificationSelected(this.specification.Children[0], false)
                }
            }
        }
        if (this.configuration && this.specification) {
            this.diag.logVerbose('Loading metadata.', `${SpecificationItemChoiceComponent.name}.ngOnChanges()`)
            this.buildMetadata(this.configuration, flattenArray(this.specification, s => s.Children))
        }

        if (this.specification.SpecificationTypeSystemName === 'FeatureGroup') {
            if (changes['configuration']) {
                let selected = !this.configuration ? null
                    : !this.configuration.Items.some(c => c.KeySpecificationID === this.specification.ID) ? null
                        : this.configuration.Items.find(c => c.KeySpecificationID === this.specification.ID)

                this.specification.Selected = !!selected
                if (selected) {
                    this.specification.Children.forEach(spec => spec.Selected = (spec.ID === selected.ValueSpecificationID))
                }
            }
        }
    }
    ngOnDestroy() {
        this._configurationSub.unsubscribe()
    }
    on_choiceSpecificationSelected(specification: ISpecification, content: any) {
        this.choiceSpecification = specification
        if(this.size === 'xs') {
            this.colorPalletModal.show()
        }
    }
    on_specificationSelected(arg: SelectionArgs) {
        arg.specification.Selected = true
        this.choiceSpecification.Selected = true
        this.choiceSpecificationSelected.emit(new ChoiceArgs(this.choiceSpecification, arg.specification))
        if(this.size === 'xs') {
            this.colorPalletModal.hide()
        }
    }
    specificationItemClickedHandler(specification: ISpecification) {
        specification.Selected = true

        this.specification.Selected = true
        this.setDisplay(specification.DisplayName, specification.Pricing[this.appState.CurrentUser.PriceLevel], specification.Metadata['ui.designer.feature.image.source'], specification.Metadata['ui.designer.tooltip'])
        this.specification.Pricing[this.appState.CurrentUser.PriceLevel] = specification.Pricing[this.appState.CurrentUser.PriceLevel]
        this.specification.Metadata['ui.designer.displayname'] = specification.DisplayName
        this.specification.Metadata['ui.designer.feature.image.source'] = specification.Metadata['ui.designer.feature.image.source']
        this.featureGroupModal.hide()
        this.choiceSpecificationSelected.emit(new ChoiceArgs(this.specification, specification))
    }
    specificationItemGroupClickedHander(content: any) {
        if (this.specification.Selected) {
            this.specification.Selected = false
            this.specification.Pricing[this.appState.CurrentUser.PriceLevel] = 0
            this.specification.Metadata['ui.designer.displayname'] = ""
            this.specification.Metadata['ui.designer.feature.image.source'] = ""
            this.choiceSpecificationSelected.emit(new ChoiceArgs(this.specification, this.selectedChild))
            this.selectedChild.Selected = false
            this.resetDisplay()
        } else {
            this.featureGroupModal.show()
        }
    }
    resetClickHander() {
        this.appState.resetConfigurationChildren(this.specification.ID)
    }
    private setDisplay(displayName: string, price: number, imgUrl: string, tooltip: string) {
        this.displayName = displayName
        this.price = price
        this.imgUrl = imgUrl
        this.tooltip = tooltip
    }
    private resetDisplay() {
        let defaultChild = this.specification.Children.find(c => !!c.Metadata["ui.designer.default"])
        if (defaultChild && defaultChild.Metadata["ui.designer.default"].toLowerCase() === "true") {
            this.setDisplay(defaultChild.DisplayName, defaultChild.Pricing[this.appState.CurrentUser.PriceLevel], defaultChild.Metadata['ui.designer.feature.image.source'], defaultChild.Metadata['ui.designer.tooltip'])
        } else {
            this.setDisplay(this.specification.Metadata['ui.designer.default.displayname'], 0, this.specification.Metadata['ui.designer.default.image.source'], this.specification.Metadata['ui.designer.tooltip'])
        }
    }
    private buildMetadata(configuration: IConfiguration, specifications: ISpecification[]) {
        this.specificationMetadata = {}
        configuration.Items.forEach(c => {
            if (specifications.some(spec => spec.ID === c.ValueSpecificationID)) {
                this.specificationMetadata[c.KeySpecificationID] = specifications
                    .find(spec => spec.ID === c.ValueSpecificationID)
                    .Metadata
            }
        })
    }
}