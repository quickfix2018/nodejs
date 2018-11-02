import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, Inject, forwardRef } from '@angular/core'
import { MultiSelectArgs, ChoiceArgs, SelectionArgs } from '../event-args'
import { SpecificationEventArgs } from '../event-args'
import { ISpecification } from '../specification'
import { IConfiguration } from '../../configuration'
import { DiagnosticService, flattenArray, ApplicationState } from '../../_shared'
import { ResponsiveHelper } from '../../_shared/util'

@Component({
    moduleId: module.id,
    selector: 'cwd-specification-options',
    templateUrl: 'specification-options.component.html',
    styleUrls: ['specification-options.component.css']
})
export class SpecificationOptionsComponent extends ResponsiveHelper implements OnInit {
    @Input() specification: ISpecification
    @Input() configuration: IConfiguration
    @Output() childSpecificationSelectedEvent = new EventEmitter()
    @Output() multiSpecificationSelected = new EventEmitter()
    public selectedParent: ISpecification
    public choiceGroups: string[] = ['Flooring', 'Engine', 'Speakers', 'Propeller', 'FeatureGroup' ]
    public size: string
    constructor(@Inject(forwardRef(() => ApplicationState)) private appState: ApplicationState,) {
        super()
        this.bootStrapObj$.subscribe(obj => this.size = obj.Size)
    }
    ngOnInit() {
        this.selectedParent = this.specification.Children[0]
        //this.selectedParent.SelectedChildCount = this.selectedParent.SelectedChildCount ||
        //    flattenArray(this.configuration, c => c.Children).map(c => c.KeySpecificationID === this.selectedParent.ID).length
        //this.selectedParent.SelectedChildCount = this.selectedParent.SelectedChildCount || 0
        //this.setCount(this.selectedParent)
        this.specification.Children.forEach(s => this.setCount(s))
    }
    specificationParentClickedHandler(parent: ISpecification) {
        this.selectedParent = parent
        //this.selectedParent.SelectedChildCount = this.selectedParent.SelectedChildCount || 0
        this.setCount(this.selectedParent)
    }

    specificationItemClickedHandler(arg:any) {
        const child =
            arg instanceof ChoiceArgs ? arg.selectionSpecification :
            arg instanceof MultiSelectArgs ? arg.selectionSpecification :
            arg instanceof SelectionArgs ? arg.specification :
            undefined

        const attributeData =
            arg instanceof SelectionArgs ? arg.attributeData : undefined

        if (arg instanceof SelectionArgs) {
            child.Selected = !child.Selected
        }

        this.selectedParent.Selected = this.choiceGroups.some(n => n === this.selectedParent.SpecificationTypeSystemName)
            ? child.Selected
            : this.specification.Selected

        const selectionArgs =
            (arg instanceof ChoiceArgs)
                ? arg
                : this.choiceGroups.some(n => n === this.selectedParent.SpecificationTypeSystemName)
                    ? new ChoiceArgs(this.selectedParent, child)
                    : new MultiSelectArgs(this.selectedParent, child, '', attributeData)

        this.childSpecificationSelectedEvent.emit(selectionArgs)
        this.updateCount(this.selectedParent.ID)
    }

    private updateCount(specID: number) {
        let curr = this.specification.Children.find(s => s.ID === specID)
        if (curr) {
            curr.SelectedChildCount = this.choiceGroups.some(n => n === curr.SpecificationTypeSystemName) ? 1 : curr.Children.filter(s => s.Selected).length
        }
    }

    private setCount(spec: ISpecification) {
        spec.SelectedChildCount = spec.SelectedChildCount || 0
        var foundCount = 0
        this.configuration
            .Items
            .forEach(c => {
                if (c.KeySpecificationID === spec.ID) {
                    foundCount = this.choiceGroups.some(n => n === spec.SpecificationTypeSystemName) ? 1 : (foundCount + 1)
                }
            })
        spec.SelectedChildCount = foundCount
    }
}