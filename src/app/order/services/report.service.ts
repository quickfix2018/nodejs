import { Injectable, Inject, forwardRef } from '@angular/core';
import { Http } from '@angular/http';
import { BaseProxy } from '../../_shared/services/base-proxy.service';
import { DiagnosticService } from '../../_shared/services/diagnostic.service';
import { AuthService } from '../../auth';

export interface MonthlyDealerSales {
    Dealer: string;
    Year: number;
    Month: number;
    Count: number;
}

export interface MonthlyModelMix {
    Model: string;
    Year: number;
    Month: number;
    Count: number;
}

export interface MonthlyCanceledOrder {
    Dealer: string;
    Year: number;
    Month: number;
    Count: number;
}

export class ReportService extends BaseProxy {
    constructor(
        @Inject(forwardRef(() => Http)) http: Http,
        @Inject(forwardRef(() => DiagnosticService)) diag: DiagnosticService,
        @Inject(forwardRef(() => AuthService)) auth: AuthService
    ) {
        super(http, diag, '/', 'api/os/report');
    }

    public getMonthlyDealerSales() {
        return this
            .httpGet('/monthly-dealer-sales', res => <MonthlyDealerSales[]>res.json());
    }

    public getMonthlyModelMix() {
        return this
            .httpGet('/monthly-model-mix', res => <MonthlyModelMix[]>res.json());
    }

    public getMonthlyCanceledOrders() {
        return this
            .httpGet('/monthly-canceled-orders', res => <MonthlyCanceledOrder[]>res.json());
    }
}
