//import { Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges } from '@angular/core'
//import { ISpecification } from '../specification'
//import { ISpecificationMetadata } from '../../specification-metadata'
//import { SpecificationService } from '../services/specification.service'
//import { DiagnosticService, flattenArray } from '../../_shared'
//import { IConfiguration, ConfigurationService } from '../../configuration'
//import { Observable, Subscription } from 'rxjs/Rx'
//import 'rxjs/add/operator/map'
//import 'rxjs/add/operator/filter'

//export interface ISpecificationMetadataDictionary {
//    [metadataKey: string]: string
//}

//@Component({
//    selector: 'cwd-specification-button-list',
//    templateUrl: 'app/specification/specification-button-list/specification-button-list.component.html',
//    styleUrls: ['app/specification/specification-button-list/specification-button-list.component.css']
//})
//export class SpecificationButtonListComponent implements OnInit, OnChanges, OnDestroy {
//    @Input() parentSpecification: ISpecification
//    @Input() configuration: IConfiguration
//    @Output() specificationButtnListSelectedEvent = new EventEmitter()
//    selectedItem: ISpecification
//    metadata: { [key: number]: ISpecificationMetadataDictionary }
//    constructor(
//        private specificationService: SpecificationService,
//        private configurationService: ConfigurationService,
//        private diag: DiagnosticService
//    ) {
//        this.metadata = {}
//    }
//    ngOnInit() {
//        this.diag.logVerbose('ngOnInit()', SpecificationButtonListComponent.name)
//    }
//    ngOnChanges(changes: SimpleChanges) {
//        this.diag.logVerbose('Property changed', `${SpecificationButtonListComponent.name}.ngOnChanges()`)
//        if (changes['parentSpecification'] && changes['parentSpecification'].isFirstChange()) {
//            if (this.parentSpecification && this.parentSpecification.Children) {
//                this.btnClicked(this.parentSpecification.Children[0])
//            }
//        }
//        if (this.configuration && this.parentSpecification) {
//            this.buildMetadata(this.configuration, flattenArray(this.parentSpecification, s => s.Children))
//        }
//    }
//    ngOnDestroy() { }
//    getMetadata(id: number, key: string) {
//        if (this.configuration && this.parentSpecification) {
//            this.buildMetadata(this.configuration, flattenArray(this.parentSpecification, s => s.Children))
//        }

//        if (!this.metadata) {
//            return ''
//        }

//        return this.metadata[id] ? this.metadata[id][key] : ''
//    }
//    buildMetadata(configuration: IConfiguration, specifications: ISpecification[]) {
//        if (specifications.some(spec => spec.ID === configuration.ValueSpecificationID)) {
//            this.metadata = this.metadata || {}
//            this.metadata[configuration.KeySpecificationID] = {}
//            specifications
//                .find(spec => spec.ID === configuration.ValueSpecificationID)
//                .SpecificationMetadata
//                .forEach(meta => {
//                    this.metadata[configuration.KeySpecificationID][meta.Key] = meta.Value
//                })
//        }
//        if (configuration.Children && configuration.Children.length > 0) {
//            configuration.Children.forEach(child => this.buildMetadata(child, specifications))
//        }
//    }
//    btnClicked(item: ISpecification) {
//        this.selectedItem = item
//        this.specificationButtnListSelectedEvent.emit(this.selectedItem)
//    }
//}