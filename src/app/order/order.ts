import { IDealer } from '../dealer'
export interface IOrderSurcharge {
    SurchargeTypeID: number,
    SurchargeTypeName: string,
    SurchargeTypeCode: string,
    Amount: number
}
export interface IOrderDiscount {
    ID: number;
    OrderID: number;
    DiscountAmount: number;
    DiscountTypeID: number;
    DiscountTypeName: string;
    Description: string;
}
export interface IOrderItem {
    ID: number,
    OrderID: number,
    Description: string,
    Amount: number
}
export interface IOrder {
    ID: number,
    ModelName: string,
    OrderStatusID: number,
    DealerPO: string,
    HullID: string,
    OrderDate: Date,
    EngineID: string,
    TransmissionID: string,
    TrailerID: string,
    FinancedBy: string,
    Trailer: number,
    Freight: number,
    ConfigurationID: number,
    OptionsTotal: number,
    DealerBoatPrice: number,
    Surcharge: number,
    SubTotal: number,
    Total: number,
    DealerID: number,
    Dealer: IDealer,
    CreatedBy: string,
    CreatedDate: Date,
    ModifiedBy: string,
    ModifiedDate: Date,
    WinterRebate: boolean,
    OrderSurcharges: IOrderSurcharge[],
    OrderDiscounts: IOrderDiscount[],
    DiscountTotal: number,
    GelcoatColors?: { [Key: string]: string },
    UpholsteryColors?: { [Key: string]: string },
    IsCollapsed?: boolean,
    OrderItems: IOrderItem[],
    SprayDate: Date,
    SprayDateScheduleType: number
}