import { Component, Input, Output, EventEmitter } from '@angular/core'
import { ISpecification } from '../specification'
import { MultiSelectArgs } from '../event-args'
import { IConfiguration } from '../../configuration'
import { DiagnosticService, flattenArray } from '../../_shared'
import { SelectionArgs } from '../event-args'

@Component({
    moduleId: module.id,
    selector: 'cwd-specification-stack-panel',
    templateUrl: 'specification-stack-panel.component.html',
    styleUrls: ['specification-stack-panel.component.css']
})
export class SpecificationStackPanelComponent {
    @Input() configuration: IConfiguration
    @Input() specification: ISpecification
    @Output() specificationSelectedEvent = new EventEmitter()
    componentName: string
    constructor(private diag: DiagnosticService) {
        this.componentName = SpecificationStackPanelComponent.name
        this.diag.logVerbose(`Instantiating ${this.componentName} component`, `${this.componentName}.constructor()`)
    }
    specificationClickedHandler(specification: ISpecification) {
        specification.Selected = !specification.Selected
        this.specificationSelectedEvent.next(new MultiSelectArgs(this.specification, specification));
    }
}