import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ISpecificationPricing } from '../specification-pricing';
import { IDealerPriceLevel } from '../dealer-pricing-level';

import { AuthService } from '../../auth'
import { DiagnosticService, BaseProxy } from '../../_shared';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'

@Injectable()
export class PricingService extends BaseProxy {
    constructor(
        private auth: AuthService,
        private http: Http,
        private diag: DiagnosticService
    ) {
        super(http, diag, '/', '/api');
    }
    getDealerPricingLevels(): Observable<IDealerPriceLevel[]> {
        return this
            .httpGet('/admin/dealerpricelevels', res => <IDealerPriceLevel[]>res.json() || []);
    }
    getDealerPricing(dealerID: number): Observable<ISpecificationPricing[]> {
        return this
            .httpGet('/specificationpricing', res => <ISpecificationPricing[]>res.json() || []);
    }
    getBasePrice(orderID:number): Observable<IDealerPriceLevel[]> {
        return this
            .httpGet(`/admin/baseprice/${orderID}`, res => <IDealerPriceLevel[]>res.json() || []);
    }
}
