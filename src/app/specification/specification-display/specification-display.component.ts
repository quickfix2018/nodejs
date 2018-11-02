import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core'
import { ISpecification } from '../specification'
import { ISpecificationMetadata } from '../../specification-metadata'
import { IConfiguration } from '../../configuration'
import { SpecificationEventArgs } from '../event-args'
import { DiagnosticService } from '../../_shared'

@Component({
    moduleId: module.id,
    selector: 'cwd-specification-display',
    templateUrl: 'specification-display.component.html'
})
export class SpecificationDisplayComponent {
    @Input() specification: ISpecification
    @Input() configuration: IConfiguration
    @Input() siblingCount: number
    @Output() specificationSelectedEvent = new EventEmitter()
    constructor(private diag: DiagnosticService) { }
    specificationSelectedEventHandler(arg: SpecificationEventArgs) {
        this.specificationSelectedEvent.emit(arg)
    }
    groupSelectedEventHandler(arg: SpecificationEventArgs) {
        this.specificationSelectedEvent.emit(arg)
    }
    multiSelectedEventHandler(arg: SpecificationEventArgs) {
        this.specificationSelectedEvent.emit(arg)
    }
}