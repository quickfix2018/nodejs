import { IConfigurationItem } from './iconfiguration'

export const trailerFilter = (item: IConfigurationItem) =>
    (item.ValueSpecification.DisplayName.indexOf('Boatmate Trailer') > -1) ||
    (item.ValueSpecification.SystemName.indexOf('TrailerOption') > -1)

export const notTrailerFilter = (item: IConfigurationItem) =>
    !trailerFilter(item)
