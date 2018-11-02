import { Injectable }  from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { IDiscount } from '../discount';
import { AuthService } from '../../auth'
import { DiagnosticService } from '../../_shared';
import { BaseProxy } from '../../_shared/services/base-proxy.service';
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'

@Injectable()
export class DiscountService extends BaseProxy {
    constructor(
        private auth: AuthService,
        private http: Http,
        private diag: DiagnosticService
    ) {
        super(http, diag, '/', 'api/discount');
    }
    getDiscount(): Observable<IDiscount[]> {
        return this.httpGet('/', res => <IDiscount[]>res.json() || []);
    }
    getDealerModelDiscount(discountKey:string, dealerID:number): Observable<IDiscount[]> {
        return this
            .httpGet(`/discountkey/${discountKey}/dealerID/${dealerID}`, res => <IDiscount[]>res.json() || []);
    }
    getDiscountForOrder(orderID:number, dealerID:number): Observable<IDiscount[]> {
        return this
            .httpGet(`/${orderID}/${dealerID}`, res => <IDiscount[]>res.json() || []);
    }
}

export function asLookup(discounts$: Observable<IDiscount[]>) {
    return discounts$
        .map(ds => ds
            .reduce((prev, curr) => {
                const keyLookup = prev[curr.DiscountKey] || {}
                const priceLevelLookup = keyLookup[curr.PriceLevel] || []
                priceLevelLookup.push(curr)

                keyLookup[curr.PriceLevel] = priceLevelLookup
                prev[curr.DiscountKey] = keyLookup

                return prev
            }, <{ [Key: string]: { [priceLevel: number]: IDiscount[] } }>{}))
}
