import { Injectable, Inject, forwardRef } from '@angular/core'
import { Http, Headers, Response } from '@angular/http'
import { Router } from '@angular/router'
import { DiagnosticService, ApplicationState } from '../../_shared'
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx'
import { IUserInfo } from '../user-info'
import { IAuthHttp } from '../auth-http'
import { ToastsManager } from 'ng2-toastr/src/toast-manager'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'

@Injectable()
export class AuthService {
    private baseUrl: string
    private authKey: string
    private userKey: string
    private _userInfo$: Subject<IUserInfo>
    private _redirectUrlKey: string = '__redirect_url'
    private lockSettings$ = this
        .appState
        .appSettings$
        .filter(setting => !!setting['auth0:ClientID'] && !!setting['auth0:Domain'])
    redirectUrl: string


    get userInfo$() {
        return this._userInfo$.asObservable()
    }

    constructor(
        @Inject(forwardRef(() => Http)) private http: Http,
        @Inject(forwardRef(() => DiagnosticService)) private diag: DiagnosticService,
        @Inject(forwardRef(() => ApplicationState)) private appState: ApplicationState,
        @Inject(forwardRef(() => Router)) private router: Router
    ) {
        this.baseUrl = ''
        this.redirectUrl = ''
        this.authKey = 'authorization_token_key'
        this._userInfo$ = new Subject<IUserInfo>()
        if (!!sessionStorage.getItem(this.userKey)) {
            let userObj = <any>sessionStorage.getItem(this.userKey)
            this._userInfo$.next(<IUserInfo>userObj)
        }
    }

    isLoggedIn(): boolean {
        const expireIn = sessionStorage.getItem('expire_in')
        const hasExpired = !!expireIn ? this.isTokenExpired(Date.parse(expireIn)) : true
        if (hasExpired) {
            sessionStorage.removeItem(this.userKey)
            sessionStorage.removeItem(this.authKey)
            sessionStorage.removeItem('expire_in')
        }
        return !hasExpired
    }
    changePassword(oldPass: string, newPass: string, confirmPass: string): Observable<boolean> {
        let body: any = {
            'OldPassword': oldPass,
            'NewPassword': newPass,
            'ConfirmPassword': confirmPass
        }

        return this
            .http
            .post(`${this.baseUrl}/api/account/changepassword`, JSON.stringify(body))
            .map((res: Response) => {
                if (res.status < 200 || res.status >= 300) {
                    this.diag.logError(``)
                    throw new Error()
                }

                return true
            })
            .catch((error: any) => {
                let errMessage = error.message || 'Internal Server Error'
                this.diag.logError(errMessage, `${AuthService.name}.changePassword()`)
                return Observable.throw(errMessage)
            })
    }
    login(): Observable<string> {
        return this.http.get(`${this.baseUrl}/Auth0Account/Login`)
            .map((res: Response) => {
                if (res.status < 200 || res.status >= 300) {
                    this.diag.logError(`Error Response Status (${res.status}) while logging in.`, AuthService.name + '.login()')
                    throw new Error(`Error Response Status (${res.status}) while logging in.`);
                }
                return <IAuthHttp>res.json()
            })
            .map((authHttp: IAuthHttp) => {
                if (authHttp.access_token) {
                    let jsonAuthHttp = JSON.stringify(authHttp)
                    sessionStorage.setItem(this.authKey, jsonAuthHttp)
                    return authHttp.access_token
                }
                return ''
            })
            .catch((error: any) => {
                // In a real world app, we might use a remote logging infrastructure
                let errMsg = error.message || 'Server error';
                this.diag.logError(errMsg, AuthService.name + '.login()')
                return Observable.throw(errMsg);
            });
    }
    // logout(): Observable<boolean> {
    //     return this.http.post('/api/Account/Logout', null)
    //         .map(res => {
    //             if (res.status < 200 || res.status >= 300) {
    //                 this.diag.logError(`Error Response Status (${res.status}) while requesting logged in UserInfo.`, AuthService.name + '.getLoggedInUserInfo()')
    //                 throw new Error(`Error Response Status (${res.status}) while requesting logged in UserInfo.`);
    //             }

    //             sessionStorage.removeItem(this.userKey)
    //             sessionStorage.removeItem(this.authKey)
    //             this.appState.resetCurrentUser()
    //             this.toastsManager.success('Successful Sign Out', 'Success')
    //             return true
    //         })
    // }
    logout(): Observable<boolean> {
        sessionStorage.removeItem(this.userKey)
        sessionStorage.removeItem(this.authKey)
        this.appState.resetCurrentUser()

        window.location.href = '/Auth0Account/LogOff';

        return Observable.create(() => true);
    }
    getLoggedInUserInfo() {
        this.diag.logVerbose('Getting UserInfo', `${AuthService.name}.getLoggedInUserInfo()`)
        return this.http.get(`${this.baseUrl}/api/Account/UserInfo`)
            .map((res: Response) => {
                if (res.status < 200 || res.status >= 300) {
                    this.diag.logError(`Error Response Status (${res.status}) while requesting logged in UserInfo.`, AuthService.name + '.getLoggedInUserInfo()')
                    throw new Error(`Error Response Status (${res.status}) while requesting logged in UserInfo.`);
                }
                this.diag.logVerbose('Requested UserInfo found.', `${AuthService.name}.getLoggedInUserInfo()`)
                let userInfo = <IUserInfo>res.json()
                sessionStorage.setItem(this.userKey, res.json())
                this._userInfo$.next(userInfo)
                return userInfo
            })
            .catch((error: any) => {
                // In a real world app, we might use a remote logging infrastructure
                let errMsg = error.message || 'Server error';
                this.diag.logError(errMsg, AuthService.name + '.getLoggedInUserInfo()')
                return Observable.throw(errMsg);
            })
    }
    private isTokenExpired(expireIn: number, offsetSeconds?: number) {
        const curr = Date.parse(new Date().toUTCString())
        return curr > expireIn;
    }
    private cleanLocalStorage() {
        // Remove token from sessionStorage
        localStorage.removeItem('id_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('expires_at');
        sessionStorage.removeItem('profile');
        this.appState.CurrentUser = JSON.parse('{}')
    }
}
