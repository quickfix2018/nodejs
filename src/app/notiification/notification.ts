export interface Notification {
    id: number,
    message: string,
    date: Date,
    read: boolean,
}

export interface PagedResult<T> {
    hasNext: boolean,
    data: T[]
}