export interface IOrderNote {
    ID: number
    OrderID: number
    Internal: boolean
    Note: string
    ModifiedBy: string
    ModifiedDate: Date
    CreatedBy: string
    CreatedDate: Date
}