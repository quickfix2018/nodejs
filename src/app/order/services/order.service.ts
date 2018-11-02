import { Injectable }  from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { IOrder, IOrderDiscount, IOrderSurcharge } from '../order';
import { AuthService } from '../../auth'
import { DiagnosticService, ApplicationState, BaseProxy } from '../../_shared';
import { IOrderStatus } from '../order-status'
import { IConfiguration } from '../../configuration'
import { IDiscount } from '../../discount'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/catch'
import { error } from 'util';
import { extend } from 'webdriver-js-extender';
import { IOrderNote } from '../order-note';

@Injectable()
export class OrderService extends BaseProxy {
    constructor(
        diag: DiagnosticService,
        private http: Http,
        private auth: AuthService,
        private appState: ApplicationState
    ) {
        super(http, diag, '/', 'api')
    }
    getOrders(page = 1, orderBy = 'ID', ascending = false, spraySchedule: number = null): Observable<IOrder[]> {
        return this.httpGet(
            `orders?page=${page}&orderBy=${orderBy}&ascending=${ascending}&spraySchedule=${spraySchedule}`,
            res => <IOrder[]>res.json() || []);
    }

    getScheduledOrders(year: number, month: number, day: number = undefined): Observable<IOrder[]> {
        return this.httpGet(
            `orders/schedule/${year}/${month}/${day || ''}`,
            res => <IOrder[]>res.json());
    }

    getScheduledOrdersByWeek(year: number, week: number, scheduleType: number = undefined) {
        return this.httpGet(
            `orders/schedule/week/${year}/${week}` + ((scheduleType) ? `?scheduleType=${scheduleType}` : ''),
            res => <IOrder[]>res.json());
    }

    getOrderPages(): Observable<number> {
        return this.httpGet('orders/pages', res => <number>res.json());
    }

    addOrder(configurationID: number, discount: IDiscount): Observable<IOrder> {
        let order = this.createEmptyOder();
        order.ConfigurationID = configurationID;
        order.DealerID = this.appState.CurrentUser.DealerID;
        if (discount) {
            order.OrderDiscounts.push({
                ID: 0,
                Description: discount.DiscountTypeName,
                OrderID: 0,
                DiscountAmount: discount.Amount,
                DiscountTypeID: discount.DiscountTypeID,
                DiscountTypeName: discount.DiscountTypeName
            });
        }
        return this.httpPost('/orders/', order, res => <IOrder>res.json());
    }
    updateOrder(order: IOrder): Observable<IOrder> {
        return this.httpPut('/orders/', order, res => <IOrder>res.json());
    }
    getDealerOrder(orderID: number, dealerID: number): Observable<IOrder> {
        return this.httpGet(`/${orderID}/dealerID/${dealerID}`, res => <IOrder>res.json());
    }
    getOrderStatuses(): Observable<IOrderStatus[]> {
        return this.httpGet('/orderstatuses/', res => <IOrderStatus[]>res.json());
    }
    getPreOrder(configuration: IConfiguration, programName: string, dealerID: number): Observable<IOrder> {
        return this.httpPost(
            `/orders/getPreOrder?programName=${programName}&dealerID=${dealerID}`,
            configuration,
            res => <IOrder>res.json() || null);
    }
    recalculate(order: IOrder): Observable<IOrder> {
        return this.httpPost(
            'orders/recalculate',
            order,
            res => <IOrder>res.json());
    }
    scheduleOrder(order: IOrder, field: string, date: Date, type: number) {
        return this.httpPost(`/schedule/${order.ID}`,
            { Field: field, ScheduleDate: date, ScheduleType: type},
            res => {});
    }
    lockOrder(orderID: number, lockState: boolean) {
        return this.httpPut(`/lock/${orderID}?lockState=${lockState}`, { }, res => res)
    }
    getNotes = (orderID: number) =>
        this.httpGet(`/${orderID}/notes`, res => res.json() as IOrderNote[])
    addNote = (orderID: number, note: string, internal: boolean = false) =>
        this.httpPost(`/${orderID}/notes`, { note, internal }, res => ({ success: true }))
    createEmptyOder(): IOrder {
        return <IOrder>{
            ID: 0,
            DealerID: 0,
            Dealer: null,
            OrderStatusID: 0,
            ModelName: '',
            DealerPO: '',
            HullID: '',
            OrderDate: null,
            EngineID: '',
            TransmissionID: '',
            ConfigurationID: 0,
            TrailerID: '',
            FinancedBy: '',
            Freight: 0,
            Trailer: 0,
            OptionsTotal: 0,
            DealerBoatPrice: 0,
            Surcharge: 0,
            SubTotal: 0,
            Total: 0,
            CreatedBy: '',
            CreatedDate: null,
            ModifiedBy: '',
            ModifiedDate: null,
            WinterRebate: null,
            OrderSurcharges: [],
            OrderDiscounts: [],
            DiscountTotal: 0
        }
    }
}
