import { Injectable, forwardRef, Inject } from '@angular/core'
import { Http } from '@angular/http'
import { Observable, Subject } from 'rxjs/Rx'
import { IConfiguration } from '../iconfiguration'
import { createConfiguration, createTrimedConfiguration } from '../configuration'
import { ISpecification } from '../../specification'
import { DiagnosticService, ApplicationState } from '../../_shared'
import { BaseProxy } from '../../_shared/services/base-proxy.service'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import 'rxjs/add/observable/from'
import 'rxjs/add/operator/mergeMap'
import { AuthService } from '../../auth/services/auth.service'

@Injectable()
export class ConfigurationService extends BaseProxy {
    private _configuration$: Subject<IConfiguration>
    private _configurationList$: Subject<IConfiguration[]>
    private baseUrl: string
    private dataStore: {
        configuration: IConfiguration,
        configurations: IConfiguration[]
    }
    private dirty: boolean
    get configuration$() {
        return this._configuration$.asObservable()
    }
    get configurationList$() {
        return this._configurationList$.asObservable()
    }

    constructor(
        http: Http,
        @Inject(forwardRef(() => DiagnosticService)) diag: DiagnosticService,
        @Inject(forwardRef(() => ApplicationState)) private appState: ApplicationState,
        @Inject(forwardRef(() => AuthService)) private auth: AuthService
    ) {
        super(http, diag, '/', 'api/customwise/configuration')

        this._configuration$ = new Subject<IConfiguration>()
        this._configurationList$ = new Subject<IConfiguration[]>()
        this.dirty = true
        this.dataStore = {
            configuration: createConfiguration(null, this.appState.CurrentUser.UserName, this.appState.CurrentUser.UserName),
            configurations: []
        }
    }
    private insertConfiguration(configuration: IConfiguration) {
        this.httpPut('', configuration, res => res).subscribe(
            res => {
                this._diag.logVerbose('Extracting http response data.', ConfigurationService.name + '.addroot()')
                if (res.status < 200 || res.status >= 300) {
                    this._diag.logError(`Response status: ${res.status}`, ConfigurationService.name + '.addroot()')
                    throw new Error(`Response status: ${res.status}`)
                }
                this.dataStore.configuration.ID = parseInt(res.text())
                this._configuration$.next(this.dataStore.configuration)

                return res
            },
            error => {
                const errMsg = error.message || 'Server error'
                this._diag.logError(errMsg, ConfigurationService.name + '.addroot()')
                return Observable.throw(errMsg)
            })
    }

    loadConfiguration(configurationID: number) {
        if (this.dirty) {
            this.httpGet(`/${configurationID}`, res => <IConfiguration>(res.json() || {}))
                .subscribe(
                (data: IConfiguration) => {
                    this.dataStore.configuration = data
                    this.dirty = false
                    this._configuration$.next(this.dataStore.configuration)
                },
                (error: any) => {
                    // In a real world app, we might use a remote logging infrastructure
                    const errMsg = error.message || 'Server error'
                    this._diag.logError(errMsg, ConfigurationService.name + '.loadConfiguration()')
                })

        } else {
            this._configuration$.next(this.dataStore.configuration)
        }
    }
    loadAll() {
        this._diag.logInformation(`${ConfigurationService.name}.loadAll()`, ConfigurationService.name)
        this.httpGet('', res => <IConfiguration[]>(res.json() || []))
            .subscribe(
            (data: IConfiguration[]) => {
                this.dataStore.configurations = data
                this._configurationList$.next(this.dataStore.configurations)
            },
            (error: any) => {
                // In a real world app, we might use a remote logging infrastructure
                const errMsg = error.message || 'Server error'
                this._diag.logError(errMsg, ConfigurationService.name + '.loadAll()')
            })
    }

    addConfiguration(config: IConfiguration): Observable<IConfiguration> {
        return this.httpPut(
            `?priceLevel=${this.appState.CurrentUser.PriceLevel}`,
            createTrimedConfiguration(config),
            res => <IConfiguration>res.json()
        )
    }
    updateConfiguration(configuration: IConfiguration): Observable<IConfiguration> {
        return this.httpPost(
            `?priceLevel=${this.appState.CurrentUser.PriceLevel}`,
            createTrimedConfiguration(configuration),
            res => <IConfiguration>res.json()
        )
    }
    addRootConfiguration(specification: ISpecification): Observable<IConfiguration> {
        const configuration = createConfiguration(specification, this.appState.CurrentUser.UserName, this.appState.CurrentUser.UserName)
        return this.httpPut(this.baseUrl, configuration, res => <IConfiguration>res.json())
    }
    getConfigurationByID(id: number): Observable<IConfiguration> {
        return this.httpGet(`/${id}`, res => <IConfiguration>res.json())
    }
    validate(configuration: IConfiguration): Observable<IConfiguration> {
        return this.httpPost(
            `/validate`,
            createTrimedConfiguration(configuration),
            res => <IConfiguration>(res.json() || {})
        )
    }
    getConfigurationImage(configurationID: number, view: string, size: string = '') {
        return this.httpGet(`/image/${configurationID}?view=${view}&size=${size}`, res => res.json())
    }

    getConfigurationsLockState(ids: number[]) {
        return this.httpGet(`/lock?ids=${ids.join(',')}`, res => res.json())
    }
    updateConfigurationLock(id: number, lockState: boolean) {
        return this.httpPut(`/lock/${id}`, { locked: lockState }, res => res)
    }
}
