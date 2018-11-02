import { ISpecification } from '../specification'

export interface IConfiguration {
    ID: number
    CreatedBy: string
    CreatedDate: Date
    ModifiedBy: string
    ModifiedDate: Date
    Name: string

    RootSpecificationID: number
    RootSpecification: ISpecification
    RootSpecificationPrice: number
    RootDisplayName: string
    Items: IConfigurationItem[]
    HasError: boolean
    ErrorMessage: string
    // Dictionary < string, string > ValueData { get; set; } = new Dictionary<string, string>();
    ViewToken: string
    Owner: string

    ConnectedSystemName: string
    ConnectedSystemID: string

    SummaryText: string
    ImageUrl: string
    AdjustmentData: string
    // not mapped to server model
    FileName: string
    TempFileLocation: string
    ConfigurationImages: ConfigurationImage[]
}

export interface ConfigurationImage {
    Identifier: string
    FileName: string
    FileUrl: string
    TempFileLocation: string
}

export interface IConfigurationItem {
    ID: number
    CreatedBy: string
    CreatedDate: Date
    ModifiedBy: string
    ModifiedDate: Date

    KeySpecificationID: number
    KeySpecification: ISpecification
    KeyDisplayName: string
    ValueSpecificationID?: number
    ValueSpecification?: ISpecification
    ValueDisplayName: string
    ConfigurationID: number
    Configuration: IConfiguration
    HasError: boolean
    ErrorMessage: string
    SortOrder: number
    Price: number

    InputValue: string
    ValueData?: { [Key: string]: string }
    State: number

    SummaryLabel: string
    SummaryText: string
}
