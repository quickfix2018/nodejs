import { Component, Input, Output, EventEmitter, OnInit, Inject, forwardRef } from '@angular/core'
import { MultiSelectArgs, ChoiceArgs, SelectionArgs } from '../event-args'
import { SpecificationEventArgs } from '../event-args'
import { ISpecification } from '../specification'
import { IConfiguration } from '../../configuration'
import { DiagnosticService, flattenArray, ApplicationState } from '../../_shared'
import { Subscription } from 'rxjs/Subscription'

interface GroupItem {
    Name: string,
    CssClass: string
}
@Component({
    moduleId: module.id,
    selector: 'cwd-specification-group',
    templateUrl: 'specification-group.component.html',
    styleUrls: ['specification-group.component.css']
})
export class SpecificationGroupComponent implements OnInit {
    @Input() specification: ISpecification
    @Input() configuration: IConfiguration
    @Input() siblingCount: number
    @Output() subSpecificationSelected = new EventEmitter()
    @Output() specificationSelectedEvent = new EventEmitter<SelectionArgs>()
    groups: GroupItem[]
    metaKey: string

    private _configurationSub: Subscription

    constructor(@Inject(forwardRef(() => ApplicationState)) private appState: ApplicationState,) { this.groups = [] }
    ngOnInit() {
        //if (this.specification.SpecificationTypeSystemName === 'ColorPallet' && this.specification.Children) {
        //    if (this.configuration) {
        //        let tempConfig = this.configuration.Items.find(c => c.KeySpecificationID === this.specification.ParentID)
        //        this.metaKey = (!tempConfig || !tempConfig.KeySpecification) ? null : tempConfig.KeySpecification.Metadata['ui.designer.color.group.name']
        //    }
        //    this.specification.Children
        //        .forEach(spec => {
        //            let groupName = spec.Metadata['ui.designer.color.group.name']
        //            let groupCssClass = spec.Metadata['ui.designer.color.group.css-class']

        //            if (groupName && groupCssClass && !this.groups.some(g => g.Name === groupName)) {
        //                this.groups.push({ Name: groupName, CssClass: groupCssClass })
        //                this.metaKey = this.metaKey || groupName
        //            }
        //        })
        //}

        if (this.specification.SpecificationTypeSystemName === 'ColorPallet' && this.specification.Children) {
            this.specification
                .Children
                .forEach(spec => {
                    let groupName = spec.Metadata['ui.designer.color.group.name']
                    let groupCssClass = spec.Metadata['ui.designer.color.group.css-class']

                    if (groupName && groupCssClass && !this.groups.some(g => g.Name === groupName)) {
                        this.groups.push({ Name: groupName, CssClass: groupCssClass })
                    }
                })
            this.metaKey = !!this.metaKey ? this.metaKey
                : !!this.groups && this.groups.length > 0 ? this.groups[0].Name
                    : null

            this._configurationSub = this
                .appState
                .configuration$
                .filter(c => !!c)
                .flatMap(c => c.Items)
                .map(item => this.specification.Children.find(spec => spec.ID === item.ValueSpecificationID))
                .filter(item => !!item)
                .map(item => item.Metadata['ui.designer.color.group.name'])
                .filter(metaValue => !!metaValue)
                .subscribe(metaValue => this.metaKey = metaValue)
        }
    }
    ngOnDestroy() {
        if(this._configurationSub)
            this._configurationSub.unsubscribe()
    }
    on_specificationSelected(arg: SpecificationEventArgs) {
        this.subSpecificationSelected.emit(arg)
    }
    groupClickHandler(group: GroupItem) {
        this.metaKey = group.Name
    }
    specificationItemClickedHandler(specification: ISpecification) {
        this.specificationSelectedEvent.emit(new SelectionArgs(specification))
    }
}