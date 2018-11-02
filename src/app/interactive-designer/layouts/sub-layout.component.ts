/*
import { Component, OnInit, OnDestroy, Input } from '@angular/core' 
import { ActivatedRoute, Params } from '@angular/router' 
import { ISpecification, SpecificationService, SpecificationEventArgs, ChoiceArgs, MultiSelectArgs } from '../../specification' 
import { DiagnosticService, ApplicationState } from '../../_shared' 
import { ConfigurationService, IConfiguration } from '../../configuration' 
import { Observable, Subscription } from 'rxjs/Rx' 
import 'rxjs/add/operator/map' 
import 'rxjs/add/operator/switchMap' 
import 'rxjs/add/operator/filter' 

@Component({
    selector: 'cwd-sub-layout',
    templateUrl: 'sub-layout.component.html'
})
export class SubLayoutComponent implements OnInit, OnDestroy {
    private specificationID: number
    @Input() specification: ISpecification 
    configuration: IConfiguration 
    configurationSub: Subscription
    routeSub: Subscription

    constructor(
        private route: ActivatedRoute,
        private specificationService: SpecificationService,
        private configurationService: ConfigurationService,
        private diag: DiagnosticService,
        private appState: ApplicationState
    ) { }

    ngOnInit() {
        this.diag.logVerbose('ngOnInit()', SubLayoutComponent.name) 
        //this.configurationSub = this.configurationService.configuration$.subscribe(
        //    config => this.configuration = config,
        //    error => this.diag.logError(`configurationService.configuration$`, `${SubLayoutComponent.name}.ngOnInit()`))
        //this.routeSub = this.route.params
        //    .filter((params: Params) => params['specificationID'] !== undefined)
        //    .subscribe(
        //        (params: Params) => this.loadSpecification(+params['specificationID']),
        //        (error: any) => this.diag.logError('Error getting parameters.', `${SubLayoutComponent.name}.ngOnInit()`))
        //this.loadSpecification(this.appState.configuration.Children[0].KeySpecificationID)
    }
    ngOnDestroy() {
        //this.diag.logVerbose(`${SubLayoutComponent.name}.ngOnDestroy()`, SubLayoutComponent.name) 
        //if (this.configurationSub) this.configurationSub.unsubscribe()
        //if (this.routeSub) this.routeSub.unsubscribe()
    }
    on_specificationSelected(arg: SpecificationEventArgs) {
        if (arg.kind === 'ChoiceArgs') {
            this.configurationService
                .updateChoice(this.specification, (<ChoiceArgs>arg).choiceSpecification, (<ChoiceArgs>arg).selectionSpecification)
                .subscribe(
                    config => this.configuration = config,
                    error => this.diag.logError('Error saving choice configuration', `${SubLayoutComponent.name}.on_specificationSelected()`))
                
        } else if (arg.kind === 'MultiSelectArgs') {
            this.configurationService
                .updateMultiChoice(this.specification, (<MultiSelectArgs>arg).choiceSpecification, (<MultiSelectArgs>arg).selectionSpecification)
                .subscribe(
                    config => this.configuration = config,
                    error => this.diag.logError('Error saving multi select configuration', `${SubLayoutComponent.name}.on_specificationSelected()`))
        }
    }
    private loadSpecification(specificationID: number) {
        this.diag.logVerbose(`Loading Specification for ID: ${specificationID}.`, SubLayoutComponent.name) 
        this.specificationID = specificationID 
        this.specificationService.getSpecificationByID(specificationID).subscribe(
            spec => {
                this.specification = spec
                this.configuration = this.appState.configuration
            },
            error => this.diag.logError('Error getting Specification.', `${SubLayoutComponent.name}.loadSpecification()`)) 
    }
}
*/