import { Component, Input, OnInit } from '@angular/core'
import { ISpecification } from '../specification'
import { IConfiguration } from '../../configuration'
import { ISpecificationMetadata } from '../../specification-metadata'
import { DiagnosticService, flattenArray } from '../../_shared'

@Component({
    moduleId: module.id,
    selector: 'cwd-specification-choice-group',
    templateUrl: 'specification-choice-group.component.html'
})
export class SpecificationChoiceGroupComponent {
    @Input() public configuration: IConfiguration
    @Input() public specification: ISpecification
    componentName: string
    constructor(private diag: DiagnosticService) {
        this.componentName = `${SpecificationChoiceGroupComponent.name}`
        this.diag.logVerbose(`Instantiating ${this.componentName} component`, `${this.componentName}.constructor()`)
    }
}