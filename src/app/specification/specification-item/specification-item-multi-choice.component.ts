import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core'
import { ISpecification } from '../specification'
import { IConfiguration, ConfigurationService } from '../../configuration'
import { DiagnosticService, flattenArray, DataEntityState } from '../../_shared'
import { MultiSelectArgs } from '../event-args'
import { Observable } from 'rxjs/Rx'

@Component({
    moduleId: module.id,
    selector: 'cwd-specification-item-multi-choice',
    templateUrl: 'specification-item-multi-choice.component.html',
    styleUrls: ['specification-item-multi-choice.component.css']
})
export class SpecificationItemMultiChoiceComponent implements OnChanges, OnInit {
    @Input() specification: ISpecification
    @Input() configuration: IConfiguration
    @Output() subSpecificationSelected = new EventEmitter()

    constructor(
        private diag: DiagnosticService
    ) { }

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges) {
        this.diag.logVerbose('Executing ngOnChanges().', `${SpecificationItemMultiChoiceComponent.name}.ngOnChanges()`)
        if (this.specification && this.configuration) {
            this.specification.Children.forEach(s => s.Selected = this.configuration.Items.filter(c => c.State !== DataEntityState.Deleted).some(c => c.ValueSpecificationID === s.ID))
        }
    }

    on_childSpecificationClicked(specification: ISpecification) {
        specification.Selected = specification.Selected || false
        specification.Selected = !specification.Selected
        this.diag.logInformation(`Multi-Select item clicked, current selected state ${specification.Selected}.`, SpecificationItemMultiChoiceComponent.name)

        this.subSpecificationSelected.emit(new MultiSelectArgs(this.specification, specification))
    }
}