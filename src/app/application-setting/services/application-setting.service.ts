import { Injectable } from '@angular/core'
import { Http, Headers, Response } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { ToastsManager } from 'ng2-toastr/src/toast-manager'
//import { DiagnosticService } from '../../_shared'
import { IApplicationSetting } from '../application-setting'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'

@Injectable()
export class ApplicationSettingService {
    private baseUrl: string
    private _applicationSetting$: BehaviorSubject<IApplicationSetting> = new BehaviorSubject(null)
    public applicationSetting$: Observable<IApplicationSetting> = this._applicationSetting$.asObservable()
    constructor(
        private http: Http,
        //private diag: DiagnosticService,
        private toastsManager: ToastsManager,
    ) {
        this.baseUrl = '/api/appsettings'
    }

    public getApplicationSettings$(): Observable<IApplicationSetting> {
        return this.http.get(this.baseUrl)
            .map((res: Response) => {
                if (res.status < 200 || res.status >= 300) {
                    //this.diag.logError(`Error Response Status (${res.status}) while requesting Application Settings.`, ApplicationSettingService.name + ".getApplicationSettings()")
                    throw new Error(`Error Response Status (${res.status}) while requesting Application Settings.`);
                }
                let setting = <IApplicationSetting>res.json()
                return setting
            })
            .catch((error: any) => {
                let errMsg = error.message || 'Server error';
                //this.diag.logError(errMsg, ApplicationSettingService.name + ".getApplicationSettings()")
                return Observable.throw(errMsg);
            });
    }

    public getApplicationSettings(): void {
        this.http.get(this.baseUrl)
            .map((res: Response) => {
                if (res.status < 200 || res.status >= 300) {
                    //this.diag.logError(`Error Response Status (${res.status}) while requesting Application Settings.`, ApplicationSettingService.name + ".getApplicationSettings()")
                    throw new Error(`Error Response Status (${res.status}) while requesting Application Settings.`);
                }
                let setting = <IApplicationSetting>res.json()
                return setting
            })
            .catch((error: any) => {
                let errMsg = error.message || 'Server error';
                //this.diag.logError(errMsg, ApplicationSettingService.name + ".getApplicationSettings()")
                return Observable.throw(errMsg);
            })
            .subscribe(setting => this._applicationSetting$.next(setting))
    }
}
