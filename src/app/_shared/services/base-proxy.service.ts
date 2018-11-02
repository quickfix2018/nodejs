import { Http, Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { DiagnosticService } from './diagnostic.service'

export abstract class BaseProxy {
    protected _apiHost$: Observable<string>
    protected _baseUrl$: Observable<string>

    constructor(
        private _http: Http,
        protected _diag: DiagnosticService,
        hostUrl: string | Observable<string>,
        baseUrl: string = ""
    ) {
        const hostUrl$ = (typeof (hostUrl) === 'string') ? Observable.of(hostUrl) : hostUrl

        this._apiHost$ = hostUrl$

        this._baseUrl$ = this
            ._apiHost$
            .map(hostUrl => `${hostUrl}${baseUrl}`)
    }

    protected httpGet<T>(relativeUrl: string, responseMapper: (response: Response) => T): Observable<T> {
        return this
            ._baseUrl$
            .map(baseUrl => `${baseUrl}${relativeUrl}`)
            .do(url => this._diag.logVerbose(`Getting data from: '${url}'.`, BaseProxy.name + ".httpGet()"))
            .switchMap(url =>
                this._http
                    .get(url)
                    .map(res => this._validateReponseCode(res))
                    .map(responseMapper)
                    .catch(msg => this.handleGetError(msg)))
    }

    protected httpPut<T>(relativeUrl: string, body: any, responseMapper: (response: Response) => T): Observable<T> {
        return this
            ._baseUrl$
            .map(baseUrl => `${baseUrl}${relativeUrl}`)
            .do(url => this._diag.logVerbose(`Create data at: '${url}'.`, `${BaseProxy.name}.httpPut()`))
            .switchMap(url =>
                this._http
                    .put(url, body)
                    .map(res => this._validateReponseCode(res))
                    .map(responseMapper)
                    .catch(msg => this.handlePutError(msg)))
    }
    protected httpPost<T>(relativeUrl: string, body: any, responseMapper: (response: Response) => T): Observable<T> {
        return this
            ._baseUrl$
            .map(baseUrl => `${baseUrl}${relativeUrl}`)
            .do(url => this._diag.logVerbose(`Update data at: '${url}'.`, `${BaseProxy.name}.httpPost()`))
            .switchMap(url =>
                this._http
                    .post(url, body)
                    .map(res => this._validateReponseCode(res))
                    .map(responseMapper)
                    .catch(msg => this.handlePostError(msg)))
    }
    protected httpDelete<T>(relativeUrl: string, responseMapper: (response: Response) => T): Observable<T> {
        return this
            ._baseUrl$
            .map(baseUrl => `${baseUrl}${relativeUrl}`)
            .do(url => this._diag.logVerbose(`Delete data at: '${url}'.`, `${BaseProxy.name}.httpDelete()`))
            .switchMap(url =>
                this._http
                    .delete(url)
                    .map(res => this._validateReponseCode(res))
                    .map(responseMapper)
                    .catch(msg => this.handleDeleteError(msg)))
    }
    protected httpPatch<T>(relativeUrl: string, body: any, responseMapper: (response: Response) => T): Observable<T> {
        return this
            ._baseUrl$
            .map(baseUrl => `${baseUrl}${relativeUrl}`)
            .do(url => this._diag.logVerbose(`Patch data at: '${url}'.`, `${BaseProxy.name}.httpPatch()`))
            .switchMap(url =>
                this._http
                    .patch(url, body)
                    .map(res => this._validateReponseCode(res))
                    .map(responseMapper)
                    .catch(msg => this.handlePatchError(msg)))
    }
    private _validateReponseCode(response: Response) {
        if (response.status < 200 || response.status >= 300) {
            this._diag.logError(`Error Response Status (${response.status}) while requesting '${response.url}'.`, BaseProxy.name + "._validateReponseCode()")
            throw new Error(`Error Response Status (${response.status}) while requesting '${response.url}'.`);
        }
        return response
    }
    handleGetError(error: any) {
        let errMsg = error.message || 'Server error';
        this._diag.logError(errMsg, BaseProxy.name + ".handleGetError()")
        return Observable.throw(errMsg);
    }
    handlePutError(error: any) {
        let errMsg = error.message || 'Server error';
        this._diag.logError(errMsg, BaseProxy.name + ".handlePutError()")
        return Observable.throw(errMsg);
    }
    handlePostError(error: any) {
        let errMsg = error.message || 'Server error';
        this._diag.logError(errMsg, BaseProxy.name + ".handlePostError()")
        return Observable.throw(errMsg);
    }
    handleDeleteError(error: any) {
        let errMsg = error.message || 'Server error';
        this._diag.logError(errMsg, BaseProxy.name + ".handleDeleteError()")
        return Observable.throw(errMsg);
    }
    handlePatchError(error: any) {
        let errMsg = error.message || 'Server error';
        this._diag.logError(errMsg, BaseProxy.name + ".handlePatchError()")
        return Observable.throw(errMsg);
    }
}
