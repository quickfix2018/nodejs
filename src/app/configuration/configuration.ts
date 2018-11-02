import { ISpecification } from '../specification'
import { flattenArray } from '../_shared'
import { IConfiguration, IConfigurationItem } from './iconfiguration'

const createConfiguration =
    (rootSpecification: ISpecification = null, createdBy = 'anonymous', modifiedBy = 'anonymous') =>
        ({
            ID: 0,
            Name: '',
            CreatedBy: createdBy || "anonymous",
            CreatedDate: new Date(),
            ModifiedBy: modifiedBy || "anonymous",
            ModifiedDate: new Date(),
            Items: [],
            RootSpecification: rootSpecification,
            RootSpecificationID: (!rootSpecification) ? 0 : rootSpecification.ID,
            RootDisplayName: (!rootSpecification) ? '' : rootSpecification.DisplayName,
            ErrorMessage: '',
            HasError: false,
            RootSpecificationPrice: 0,
            ConnectedSystemName: '',
            ConnectedSystemID: '',
            ViewToken: '',
            Owner: '',
            SummaryText: '',
            ImageUrl: '',
            FileName: '',
            TempFileLocation: '',
            AdjustmentData: '',
            ConfigurationImages: null
        } as IConfiguration)

export {createConfiguration, createConfigurationItem}

const createConfigurationItem = (
    keySpecification: ISpecification = null,
    valueSpecification: ISpecification = null,
    configuration: IConfiguration = null,
    createdBy = 'anonymous',
    modifiedBy = 'anonymous') =>
    ({
        ID: 0,
        CreatedBy: createdBy || 'anonymous',
        CreatedDate: new Date(),
        ModifiedBy: modifiedBy || 'anonymous',
        ModifiedDate: new Date(),

        Configuration: configuration,
        ConfigurationID: (!configuration) ? 0 : configuration.ID,
        KeySpecification: keySpecification,
        KeySpecificationID: (!keySpecification) ? 0 : keySpecification.ID,
        KeyDisplayName: (!keySpecification) ? '' : keySpecification.DisplayName,
        ValueSpecification: valueSpecification,
        ValueSpecificationID: (!valueSpecification) ? null : valueSpecification.ID,
        ValueDisplayName: (!valueSpecification) ? '' : valueSpecification.DisplayName,

        ErrorMessage: '',
        HasError: false,
        InputValue: '',
        SortOrder: 0,
        State: 0,
        ValueData: valueSpecification.Metadata,
        Price: 0,

        SummaryLabel: '',
        SummaryText: '',
    } as IConfigurationItem)

export function createInputConfigurationItem(keySpecification: ISpecification = null, inputValue: string, configuration: IConfiguration, createdBy: string = null, modifiedBy: string = null): IConfigurationItem {
    return {
        ID: 0,
        CreatedBy: createdBy || "anonymous",
        CreatedDate: new Date(),
        ModifiedBy: modifiedBy || "anonymous",
        ModifiedDate: new Date(),

        Configuration: configuration,
        ConfigurationID: (!configuration) ? 0 : configuration.ID,
        KeySpecification: keySpecification,
        KeySpecificationID: (!keySpecification) ? 0 : keySpecification.ID,
        KeyDisplayName: (!keySpecification) ? "" : keySpecification.DisplayName,
        ValueSpecification: null,
        ValueSpecificationID: null,
        ValueDisplayName: "",
        InputValue: inputValue,

        ErrorMessage: '',
        HasError: false,
        SortOrder: 0,
        ValueData: null,
        State: 0,
        Price: 0,

        SummaryLabel: '',
        SummaryText: '',
    }
}

export function createTrimedConfiguration(config: IConfiguration, createdBy = "anonymous", modifiedBy = "anonymous", copyValueSpecification: boolean = false): IConfiguration {
    return <IConfiguration>{
        ID: config.ID,
        AdjustmentData: config.AdjustmentData,
        Name: config.Name,
        CreatedBy: config.CreatedBy || createdBy,
        CreatedDate: config.CreatedDate,
        ModifiedBy: config.ModifiedBy || modifiedBy,
        ModifiedDate: config.ModifiedDate,

        RootSpecificationID: config.RootSpecificationID,
        RootDisplayName: config.RootDisplayName,
        Items: config.Items.map(ci => <any>{
            ID: ci.ID,
            CreatedBy: ci.CreatedBy || "anonymous",
            CreatedDate: ci.CreatedDate,
            ModifiedBy: ci.ModifiedBy || "anonymous",
            ModifiedDate: ci.ModifiedDate,

            KeySpecificationID: ci.KeySpecificationID,
            KeyDisplayName: ci.KeyDisplayName,
            ValueSpecificationID: ci.ValueSpecificationID,
            ValueSpecification: copyValueSpecification ? ci.ValueSpecification : null,
            ValueDisplayName: ci.ValueDisplayName,
            ValueData: ci.ValueData,
            HasError: ci.HasError,
            ErrorMessage: ci.ErrorMessage,
            SortOrder: ci.SortOrder,
            Price: ci.Price,

            InputValue: ci.InputValue,
            SummaryText: ci.SummaryText,
            SummaryLabel: ci.SummaryLabel,
        }),
        HasError: config.HasError,
        ErrorMessage: config.ErrorMessage,
        RootSpecificationPrice: config.RootSpecificationPrice,
        ViewToken: config.ViewToken,
        ConnectedSystemID: config.ConnectedSystemID,
        ConnectedSystemName: config.ConnectedSystemName,

        Owner: config.Owner,
        RootSpecification: null,
        SummaryText: config.SummaryText,
        ImageUrl: '',
        FileName: '',
        TempFileLocation: '',
        ConfigurationImages: config.ConfigurationImages
    }
}

export function cloneConfiguration(config: IConfiguration): IConfiguration {
    let clone = { ...config }
    clone.Items = config.Items.map(i => ({ ...i }))
    return clone
}

export function linkConfiguration(configuration: IConfiguration, specifications: ISpecification[]): IConfiguration {
    configuration.RootSpecification = specifications.find(s => s.ID === configuration.RootSpecificationID)
    configuration.Items =
        configuration
            .Items
            .map(item => {
                item.KeySpecification = specifications.find(s => s.ID === item.KeySpecificationID) || item.KeySpecification
                item.ValueSpecification = specifications.find(s => s.ID === item.ValueSpecificationID) || item.ValueSpecification
                item.KeyDisplayName = item.KeySpecification.DisplayName
                item.ValueDisplayName = item.ValueSpecification ? item.ValueSpecification.DisplayName : null

                item.Configuration = configuration
                item.ConfigurationID = configuration.ID
                return item
            })
    return configuration
}

export function linkConfigurationFromRootSpec(specConfigPair: [ISpecification, IConfiguration]): IConfiguration {
    let [spec, config] = specConfigPair
    // link up the config to specification.
    let flatSpec = flattenArray(spec, s => s.Children)

    config.RootSpecification = spec
    config.Items =
        config
            .Items
            .map(item => {
                item.KeySpecification = flatSpec.find(s => s.ID === item.KeySpecificationID) || item.KeySpecification
                item.ValueSpecification = flatSpec.find(s => s.ID === item.ValueSpecificationID) || item.ValueSpecification
                item.KeyDisplayName = item.KeySpecification ? item.KeySpecification.DisplayName : null
                item.ValueDisplayName = item.ValueSpecification ? item.ValueSpecification.DisplayName : null
                item.ValueData = item.ValueSpecification ? item.ValueSpecification.Metadata : null
                item.Configuration = config
                item.ConfigurationID = config.ID
                return item
            })
    return config
}