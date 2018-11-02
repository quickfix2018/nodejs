import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { AuthService } from '../../auth';
import { BaseProxy } from '../../_shared/services/base-proxy.service'
import { DiagnosticService } from '../../_shared/services/diagnostic.service'
import { IPolicyResult } from './ipolicy-result'

@Injectable()
export class PolicyClientService extends BaseProxy {
    constructor(
        http: Http,
        diag: DiagnosticService,
        auth: AuthService
    ) {
        super(http, diag, '/', 'api/policy')
    }

    public createOrder = (rootSpecificationID: number) =>
        this.httpGet(
            `/order/create/${rootSpecificationID}`,
            res => (<IPolicyResult>res.json()))

    public dealer = () =>
        this.httpGet(
            `/dealer`,
            res => (<IPolicyResult>res.json()))
}
