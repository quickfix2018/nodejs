import { IArtifactMetadata } from './artifact-metadata'
import { DefaultingStrategies } from './defaulting-strategies'

export interface IArtifact {
    ID: number;
    Children: IArtifact[]
    ParentID: number
    DisplayName: string
    SpecificationTypeID: number
    SpecificationSystemTypeID: number
    IsActive: boolean
    Deleted: boolean
    Order: number
    Selected: boolean
    Metadata: IArtifactMetadata[]
    SystemName: string
    IsRoot: boolean
    DefaultingStrategy: DefaultingStrategies
    DefaultStrategyValue: string
    TotalCount: number
}