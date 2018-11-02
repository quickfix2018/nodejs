import { Injectable }  from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ISpecification } from '../specification';
//import { DiagnosticService } from '../../_shared';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'

@Injectable()
export class SpecificationService {
    private baseUrl: string;

    constructor(
        private http: Http,
        //private diag: DiagnosticService
    ) {
        this.baseUrl = '/api/customwise/specification';
    }
    getBySpecificationTypeNameAndDepth(specType: string, depth: number = 0): Observable<ISpecification[]> {
        let url = `${this.baseUrl}/${specType}/${depth}`
        //this.diag.logVerbose(`Getting data from: '${url}'.`, SpecificationService.name + ".getSpecificationsBySpecificationType()")

        return this.http
            .get(url)
            .map((res: Response) => {
                if (res.status < 200 || res.status >= 300) {
                    //this.diag.logError(`Error Response Status (${res.status}) while requesting Specifications.`, SpecificationService.name + ".getSpecificationsBySpecificationType()")
                    throw new Error(`Error Response Status (${res.status}) while requesting Specifications.`);
                }
                let body = <ISpecification[]>res.json();
                return body || [];
            })
            .catch(this.handleError)
    }
    getBySpecificationTypeFromBranch(specificationID: number, specType: string): Observable<ISpecification[]> {
        let url = `${this.baseUrl}/specification/${specificationID}/filter/${specType}`
        //this.diag.logVerbose(`Getting data from: '${url}'.`, SpecificationService.name + ".getSpecificationsBySpecificationTypeFromBranch()")

        return this.http
            .get(url)
            .map((res: Response) => {
                if (res.status < 200 || res.status >= 300) {
                    //this.diag.logError(`Error Response Status (${res.status}) while requesting Specifications.`, SpecificationService.name + ".getSpecificationsBySpecificationTypeFromBranch()")
                    throw new Error(`Error Response Status (${res.status}) while requesting Specifications.`);
                }
                let body = <ISpecification[]>res.json();
                return body || [];
            })
            .catch(this.handleError)
    }
    getBySpecificationSystemType(specSystemType: string, depth: number = 0): Observable<ISpecification[]> {
        let url = `${this.baseUrl}/specificationSystemTypeName/${specSystemType}/${depth}`
        //this.diag.logVerbose(`Getting data from: '${url}'.`, SpecificationService.name + ".getSpecificationsBySpecificationSystemType()")

        return this.http
            .get(url)
            .map((res: Response) => {
                if (res.status < 200 || res.status >= 300) {
                    //this.diag.logError(`Error Response Status (${res.status}) while requesting Specifications.`, SpecificationService.name + ".getSpecificationsBySpecificationSystemType()")
                    throw new Error(`Error Response Status (${res.status}) while requesting Specifications.`);
                }
                let body = <ISpecification[]>res.json();
                return body || [];
            })
            .catch(this.handleError)
    }
    getByID(id: number): Observable<ISpecification> {
        let url = `${this.baseUrl}/${id}`
        //this.diag.logVerbose(`Getting data from: '${url}'.`, SpecificationService.name + ".getSpecificationByID()")
        return this.http.get(url)
            .map((res: Response) => {
                if (res.status < 200 || res.status >= 300) {
                    //this.diag.logError(`Error Response Status (${res.status}) while requesting Specification.`, SpecificationService.name + ".getSpecificationByID()")
                    throw new Error(`Error Response Status (${res.status}) while requesting Specification.`);
                }
                let body = <ISpecification>res.json();
                return body || null;
            })
            .catch(this.handleError)
    }
    getByConfigurationID(id: number): Observable<ISpecification> {
        let url = `${this.baseUrl}/configuration/${id}`
        //this.diag.logVerbose(`Getting data from: '${url}'.`, SpecificationService.name + ".getByConfigurationID()")
        return this.http.get(url)
            .map((res: Response) => {
                if (res.status < 200 || res.status >= 300) {
                    //this.diag.logError(`Error Response Status (${res.status}) while requesting Specification.`, SpecificationService.name + ".getByConfigurationID()")
                    throw new Error(`Error Response Status (${res.status}) while requesting Specification.`);
                }
                let body = <ISpecification>res.json();
                return body || null;
            })
            .catch(this.handleError)
    }
    getBySystemName(systemName: string): Observable<ISpecification> {
        let url = `${this.baseUrl}/SystemName/${systemName}`
        //this.diag.logVerbose(`Getting data from: '${url}'.`, SpecificationService.name + ".getSpecificationBySystemName()")
        return this.http.get(url)
            .map((res: Response) => {
                if (res.status < 200 || res.status >= 300) {
                    //this.diag.logError(`Error Response Status (${res.status}) while requesting Specification.`, SpecificationService.name + ".getSpecificationBySystemName()")
                    throw new Error(`Error Response Status (${res.status}) while requesting Specification.`);
                }
                let body = <ISpecification>res.json();
                return body || null;
            })
            .catch(this.handleError)
    }

    private extractData(res: Response) {
        if (res.status < 200 || res.status >= 300) {
            //this.diag.logError(`Error Response Status (${res.status}) while requesting Specification.`, SpecificationService.name + ".extractData()")
            throw new Error(`Error Response Status (${res.status}) while requesting Specification.`);
        }
        let body = <ISpecification>res.json();
        return body || {};
    }
    private handleError(error: any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg = error.message || 'Server error';
        //this.diag.logError(errMsg, SpecificationService.name + ".handleError()")
        return Observable.throw(errMsg);
    }
}