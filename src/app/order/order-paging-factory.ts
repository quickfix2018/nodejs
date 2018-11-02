import { IOrder } from "../order";
import { PagingService } from "../_shared/services/paging.service";
import { OrderService } from "./services/order.service";

export interface orderPageInfo {
    page: number,
    hasNext: boolean
}

export const orderUnscheduledPagingServiceFactory = (orderService: OrderService) => {
    let pInfo: orderPageInfo = {
        hasNext: false,
        page: 1
    }

    return new PagingService<IOrder[], IOrder, orderPageInfo>(
        pageInfo => pageInfo.hasNext,
        pageInfo => orderService.getOrders(pageInfo.page, "ID", false, 0).share().first(),
        o => o,
        t => {
            pInfo = { hasNext: ((t || []).length > 0), page: (pInfo.page + 1) }
            return pInfo
        },
        () => orderService.getOrders(pInfo.page, "ID", false, 0).share().first()
    )
}

export const orderPagingServiceFactory = (orderService: OrderService) => {
    let pInfo: orderPageInfo = {
        hasNext: false,
        page: 1
    }

    return new PagingService<IOrder[], IOrder, orderPageInfo>(
        pageInfo => pageInfo.hasNext,
        pageInfo => orderService.getOrders(pageInfo.page, "ID", false).share().first(),
        o => o,
        t => {
            pInfo = { hasNext: ((t || []).length > 0), page: (pInfo.page + 1) }
            return pInfo
        },
        () => orderService.getOrders(pInfo.page, "ID", false).share().first()
    )
}
