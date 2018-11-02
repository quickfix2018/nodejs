import { Injectable } from '@angular/core'
import { Http, Response } from '@angular/http'
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx'
import { ISpecificationMetadata } from '../specification-metadata'
import { DiagnosticService } from '../../_shared'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'

@Injectable()
export class SpecificationMetadataService {
    private _specificationMetadata$: Subject<ISpecificationMetadata[]>
    private dataStore: { [specificationID:number]: ISpecificationMetadata[] }
    private baseUrl: string;

    get specificationMetadata$() {
        return this._specificationMetadata$.asObservable();
    }

    constructor(
        private http: Http,
        private diag: DiagnosticService
    ) {
        this.dataStore = {}
        this.baseUrl = "/api/customwise/specificationMetadata"
        this._specificationMetadata$ = new Subject<ISpecificationMetadata[]>()
    }

    loadSpecificationBySpecificationID(specificationID: number): void {
        this.http
            .get(`${this.baseUrl}/specification/${specificationID}`)
            .map((res: Response) => {
                this.diag.logVerbose("Extracting http response data.", SpecificationMetadataService.name + ".loadSpecificationBySpecificationID()")
                if (res.status < 200 || res.status >= 300) {
                    this.diag.logError(`Response status: ${res.status}`, SpecificationMetadataService.name + ".loadSpecificationBySpecificationID()")
                    throw new Error(`Response status: ${res.status}`);
                }
                let body = <ISpecificationMetadata[]>res.json()
                return body || []
            })
            .catch((error: any) => {
                // In a real world app, we might use a remote logging infrastructure
                let errMsg = error.message || 'Server error';
                this.diag.logError(errMsg, SpecificationMetadataService.name + ".getSpecificationTypes()")
                return Observable.throw(errMsg);
            })
            .subscribe(
            (specificationMetadata: ISpecificationMetadata[]) => {
                this.dataStore[specificationID] = specificationMetadata
                this._specificationMetadata$.next(this.dataStore[specificationID]);
            },
            (error: any) => {
                // In a real world app, we might use a remote logging infrastructure
                let errMsg = error.message || 'Server error';
                this.diag.logError(errMsg, SpecificationMetadataService.name + ".getSpecificationTypes()")
                return Observable.throw(errMsg);
            });
    }

    private specificationUrl = "/api/customwise/specificationMetadata";
    private cachedMetadata: { [specificationID: number]: ISpecificationMetadata[] } = {};

    getSpecificaitonMetadata(specificationID: number): Observable<ISpecificationMetadata[]> {
        let url = `${this.specificationUrl}/specification/${specificationID}`
        this.diag.logVerbose(`getting data from: '${url}'.`, SpecificationMetadataService.name + ".getSpecificaitonMetadata()")

        return this.http
            .get(url)
            .map((res: Response) => {
                this.diag.logVerbose("Extracting http response data.", SpecificationMetadataService.name + ".getSpecificaitonMetadata()")
                if (res.status < 200 || res.status >= 300) {
                    this.diag.logError(`Response status: ${res.status}`, SpecificationMetadataService.name + ".getSpecificaitonMetadata()")
                    throw new Error(`Response status: ${res.status}`);
                }
                let body = <ISpecificationMetadata[]>res.json()
                this.cachedMetadata[specificationID] = body || [];
                return body || []
            })
            .catch((error: any) => {
                // In a real world app, we might use a remote logging infrastructure
                let errMsg = error.message || 'Server error';
                this.diag.logError(errMsg, SpecificationMetadataService.name + ".getSpecificationTypes()")
                return Observable.throw(errMsg);
            })
    }

}