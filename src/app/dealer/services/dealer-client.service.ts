import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { IDealer } from '../dealer';
import { BaseProxy } from '../../_shared/services/base-proxy.service';
import { DiagnosticService } from '../../_shared';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { IDealerProjections } from '../idealer-projections';
import { AuthService } from '../../auth';

@Injectable()
export class DealerClientService extends BaseProxy {
    private baseUrl: string;
    private serviceName: string;
    constructor(
        http: Http,
        diag: DiagnosticService,
        auth: AuthService
    ) {
        super(http, diag, '/', 'api/dealers');
        this.serviceName = DealerClientService.name;
    }
    public getDealers = () =>
        this.httpGet('', res => (<IDealer[]>res.json()))

    public getCurrentDealer = () =>
        this.httpGet('/me', res => (<IDealer>res.json()))

    public acknowledgeDealerContract = () =>
        this.httpPost('/me/contract/acknowledge', {}, res => true)

    public getCurrentDealerProjections = () =>
        this.httpGet('/me/projections/2019', res => (<IDealerProjections[]>res.json()))

    public updateCurrentDealerProjections = (projections: IDealerProjections[]) =>
        this.httpPost('/me/projections/2019', projections, res => res)

    public getDealerProjections = id =>
        this.httpGet(`/projections/${id}/2019`, res => (<IDealerProjections[]>res.json()))
}
