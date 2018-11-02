export interface ISpecification {
    ID: number
    ParentID: number
    DisplayName: string
    SpecificationTypeID: number
    SpecificationTypeSystemName: string
    SpecificationSystemTypeID: number
    SpecificationSystemTypeSystemName: string
    IsActive: boolean
    Deleted: boolean
    Order: number
    ArtifactReferencedID: number
    Selected: boolean
    Metadata: { [Key: string]: string },
    Children: ISpecification[],
    Pricing: { [Key: number]: number },
    SelectedChildCount?: number,
    SystemName: string
}
