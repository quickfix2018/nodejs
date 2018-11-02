import { IDealer } from '../dealer'

export interface IUserInfo {
    UserName: string;
    Email: string;
    IsAdmin: boolean;
    Roles: string[];
    PriceLevel: number;
    DefaultPriceLevel: number;
    DealerID: number;
    DefaultDealerID: number;
    Dealer: IDealer;
    ImpersonationName?: string;
    DealerCodes: string[];
}

export function parsedAuth0Profile(profile: any): IUserInfo {
  const metadataNamespace = 'https://mbsports.com';
    return <IUserInfo>{
      UserName         : profile.username,
      Email            : profile.email,
      IsAdmin          : profile[`${metadataNamespace}/is_admin`],
      Roles            : profile[`${metadataNamespace}/roles`],
      //PriceLevel       : profile.email_verified,
      //DefaultPriceLevel: profile[`${metadataNamespace}/price_level`],
      //DealerID         : profile[`${metadataNamespace}/dealer_codes`][0],
      //DefaultDealerID  : profile.sub,
      //Dealer           : <IDealer>profile[`${metadataNamespace}/dealer`],
      DealerCodes      : profile[`${metadataNamespace}/dealer_codes`]
    };
}
