export interface IDealer {
    ID:number;
    Code: string;
    Name: string;
    Street: string;
    City: string;
    State: string;
    Country: string;
    Zip: string;
    Phone: string;
    Fax: string;
    PricingLevel: number;
    Settings: { [Key: string]: string };
    DealerDiscounts: { [Key: string]: { [Key: string]: number } };
    ContractAcknowledged: boolean;
    ContractUrl: string;
}