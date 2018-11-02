import { Component, Input, Output, EventEmitter, Inject, forwardRef, OnDestroy } from '@angular/core';
import { ISpecification } from '../specification';
import { ApplicationState } from '../../_shared/application-state';

@Component({
    moduleId: module.id,
    selector: 'cwd-specification-item-navigation',
    templateUrl: 'specification-item-navigation.component.html',
    styleUrls: ['specification-item-navigation.component.css']
})
export class SpecificationItemNavigationComponent implements OnDestroy {
    public filterChildren = [] as ISpecification[]

    constructor(
        @Inject(forwardRef(() => ApplicationState))
        private appState: ApplicationState
    ) { }

    private sub =
        this.appState
            .configuration$
            .map(c => c.Items)
            .map(cis => cis.some(ci => ci.ValueSpecification.DisplayName.indexOf("Boatmate Trailer") >= 0))
            .subscribe(hasTrailer =>
                this.filterChildren = (!this.specification)
                ? []
                : hasTrailer
                    ? this.specification.Children
                    : this.specification.Children.filter(s => s.DisplayName.indexOf('Trailer Options') < 0))

    ngOnDestroy() {
        this.sub.unsubscribe()
    }

    private _specification = {} as ISpecification
    @Input()
    set specification(specification: ISpecification) {
        this._specification = specification
        this.filterChildren = this.specification.Children.filter(s => s.DisplayName.indexOf('Trailer Options') < 0)
    }
    get specification(): ISpecification {
        return this._specification
    }
    @Output() navigationClicked = new EventEmitter()
    @Input() selectedID: number

    specificationClicked(specification: ISpecification) {
        this.selectedID = specification.ID
        this.navigationClicked.next(specification)
    }
    summaryClicked() {
        this.selectedID = -1
        this.navigationClicked.next(null)
    }
}