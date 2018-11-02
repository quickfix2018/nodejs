export interface ISurchargeType {
    ID: number;
    CreatedBy: string; 
    CreatedDate: Date;
    ModifiedBy: string;
    ModifiedDate: Date;
    Name: string;
    SystemName: string; 
    Amount: number;
    ItemCount: number;
    Exception: string;
    Code: string;
}

export interface ISurchargeTypeCounter {
    ValueID: number,
    ItemCount: number
}