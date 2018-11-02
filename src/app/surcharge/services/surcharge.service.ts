import { Injectable } from '@angular/core'
import { Http, Response, Headers } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { DiagnosticService, ApplicationState } from '../../_shared'
import { ISurchargeType } from '../surcharge-type'
import { IOrderSurcharge } from '../../order'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'

@Injectable()
export class SurchargeService {
    private baseUrl: string = '/api/surcharge'

    constructor(
        private http: Http,
        private appState: ApplicationState,
        private diag: DiagnosticService) { }

    getSurchargeTypes(): Observable<ISurchargeType[]> {
        let url = `${this.baseUrl}/get/surchargetypes`
        return this.http
            .get(url)
            .map((res: Response) => {
                if (res.status < 200 || res.status >= 300) {
                    this.diag.logError(`Error Response Status (${res.status}) while requesting SurchargeTypes.`, SurchargeService.name + ".getSurchargeTypes()")
                    throw new Error(`Error Response Status (${res.status}) while requesting SurchargeTypes.`)
                }
                let body = <ISurchargeType[]>res.json()
                return body || []
            })
            .catch(this.handleError)
    }
    calcSurcharges(surchargeTypes: ISurchargeType[]): Observable<IOrderSurcharge[]> {
        let url = `${this.baseUrl}/post/calc?dealerID=${this.appState.CurrentUser.DealerID}`
        return this.http
            .post(url, surchargeTypes)
            .map((res: Response) => {
                if (res.status < 200 || res.status >= 300) {
                    this.diag.logError(`Error Response Status (${res.status}) while requesting Surcharge calculation.`, SurchargeService.name + ".calcSurcharges()")
                    throw new Error(`Error Response Status (${res.status}) while requesting Surcharges calculation.`)
                }
                let body = <IOrderSurcharge[]>res.json()
                return body || []
            })
            .catch(this.handleError)
    }
    private handleError(error: any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg = error.message || 'Server error'
        //this.diag.logError(errMsg, SpecificationService.name + ".handleError()")
        return Observable.throw(errMsg)
    }
}