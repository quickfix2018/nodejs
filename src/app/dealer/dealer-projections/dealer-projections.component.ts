import { Component, Input } from "@angular/core";
import { IDealerProjections } from "../idealer-projections";
import { SpecificationService, ISpecification } from "../../specification";
import { Observable } from "rxjs/Observable";
import { ArtifactClientService } from "../../artifact/services/artifact-client.service";
import { IArtifact } from "../../artifact";

type SpecificationLookup = { [specID: number]: Observable<ISpecification> }
type ArtifactLookup = { [specID: number]: Observable<IArtifact> }

@Component({
    selector: 'mb-dealer-projections',
    templateUrl: "./dealer-projections.component.html",
    providers: [ ArtifactClientService ]
})
export class DealerProjectionsComponent {
    constructor(
        private specificationService: SpecificationService,
        private artifactService: ArtifactClientService,
    ) { }

    private _projections: IDealerProjections[] = []

    @Input()
    set projections(value: IDealerProjections[]) {
        this._projections = value || []
        this.specificationProjections = this
            ._projections
            .filter(p => p.SpecificationID)

        this.artifactProjections = this
            ._projections
            .filter(p => p.ArtifactID)

        this.specificationLookup = this
            .specificationProjections
            .reduce((prev, curr) => {
                prev[curr.SpecificationID] = this.specificationService.getByID(curr.SpecificationID)

                return prev
            }, <SpecificationLookup>{})

        this.artifactLookup = this
            .artifactProjections
            .reduce((prev, curr) => {
                prev[curr.ArtifactID] = this.artifactService.getArtifact(curr.ArtifactID)

                return prev
            }, <ArtifactLookup>{})
    }
    get projections() { return this._projections }

    artifactProjections = <IDealerProjections[]> [ ]
    specificationProjections = <IDealerProjections[]> [ ]

    specificationLookup: SpecificationLookup = {}
    artifactLookup: ArtifactLookup = {}

    monthMap = [
        { field: 'Month01Quantity', month: 'Jul' },
        { field: 'Month02Quantity', month: 'Aug' },
        { field: 'Month03Quantity', month: 'Sep' },
        { field: 'Month04Quantity', month: 'Oct' },
        { field: 'Month05Quantity', month: 'Nov' },
        { field: 'Month06Quantity', month: 'Dec' },
        { field: 'Month07Quantity', month: 'Jan' },
        { field: 'Month08Quantity', month: 'Feb' },
        { field: 'Month09Quantity', month: 'Mar' },
        { field: 'Month10Quantity', month: 'Apr' },
        { field: 'Month11Quantity', month: 'May' },
        { field: 'Month12Quantity', month: 'Jun' },
    ]
}