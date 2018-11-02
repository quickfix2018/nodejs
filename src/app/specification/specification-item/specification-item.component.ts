import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, Inject, forwardRef } from '@angular/core'
import { IConfiguration } from '../../configuration'
import { ISpecification } from '../specification'
import { flattenArray } from '../../_shared'
import { ApplicationSettingService } from '../../application-setting'
import { ApplicationState } from '../../_shared/application-state'
import { DiagnosticService } from '../../_shared/services/diagnostic.service'
import { ResponsiveHelper } from '../../_shared/util'
import { SelectionArgs } from '../event-args'
import { Observable } from 'rxjs/Observable'

@Component({
    moduleId: module.id,
    selector: 'cwd-specification-item',
    templateUrl: 'specification-item.component.html',
    styleUrls: ['specification-item.component.css']
})
export class SpecificationItemComponent extends ResponsiveHelper implements OnInit,OnChanges {
    @Input() public configuration: IConfiguration
    @Input() public specification: ISpecification
    @Output() specificationSelectedEvent = new EventEmitter()
    groupDefaultDisplayName: string
    groupDefaultImgSrc: string
    groupDefaultPricing: { [Key: number]: number }
    groupSelectedChildID: number
    componentName: string
    public isoCurrencyCode$: Observable<string>
    public size: string
    public get toolTip(): string {
        if (this.specification.SpecificationTypeSystemName === "Color") {
            return this.specification.Metadata['domain.mb.swatch.number']
                ? `${this.specification.Metadata['domain.mb.swatch.number']} : ${this.specification.DisplayName}`
                : this.specification.DisplayName
        }
        else if (this.specification.SpecificationTypeSystemName === 'ColorMetallic') {
            return this.specification.Metadata['domain.mb.swatch.number']
                ? `${this.specification.Metadata['domain.mb.swatch.number']} : ${this.specification.DisplayName}`
                : this.specification.DisplayName
        }
        else {
            return this.specification.DisplayName
        }
    }
    public isSelected$: Observable<boolean>

    constructor(
        public settingService: ApplicationSettingService,
        private diag: DiagnosticService,
        @Inject(forwardRef(() => ApplicationState)) private appState: ApplicationState
    ) {
        super()
        this.bootStrapObj$.subscribe(obj => this.size = obj.Size)
        this.componentName = SpecificationItemComponent.name
    }
    ngOnInit() {
        this.isoCurrencyCode$ =
            this.settingService
                .applicationSetting$
                .filter(setting => setting !== null)
                .map(setting => setting['IsoCurrencyFormat'])
        this.isSelected$ =
            this.appState
                .configuration$
                .map(c => c.Items.some(item => item.ValueSpecificationID === this.specification.ID))
    }
    ngOnChanges(changes: SimpleChanges) {
        if (changes['configuration'] && changes['configuration'].currentValue) {
            this.specification.Selected =
                this.configuration.Items.some(c => c.ValueSpecificationID === this.specification.ID)
        }
    }
    specificationItemClickedHandler(selectionArgs: SelectionArgs | ISpecification) {
        if (selectionArgs instanceof SelectionArgs) {
            this.specificationSelectedEvent.emit(selectionArgs)
        } else {
            this.specificationSelectedEvent.emit(new SelectionArgs(selectionArgs))
        }
    }
}