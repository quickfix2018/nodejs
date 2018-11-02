import { Injectable } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class PagingService<T, TItem, TPageInfo> {
    constructor(
        private hasNext: (pageInfo: TPageInfo) => boolean,
        private getPage: (pageInfo: TPageInfo) => Observable<T>,
        private itemMap: (pageResult: T) => TItem[],
        private pageInfoMap: (t: T) => TPageInfo,
        initialPage: () => Observable<T>
    ) {
        initialPage()
            .first()
            .subscribe(
                this.receivePage.bind(this),
                () => console.error('An error occurred while trying to get initial page.'),
                () => {})
    }

    private _hasNext = false
    private hasNextSubject = new BehaviorSubject(this._hasNext)
    public hasNext$ = this.hasNextSubject.asObservable()

    private itemsSubject = new BehaviorSubject<TItem[]>([])
    public items$ = this
        .itemsSubject
        .asObservable()
        .scan((prev: TItem[], curr: TItem[]) => prev.concat(curr), [])

    private _pageInfo: TPageInfo

    public getNext() {
        const next$ = (this._hasNext)
            ? this.getPage(this._pageInfo)
            : Observable.empty<any>()

        next$.subscribe(
            this.receivePage.bind(this),
            () => console.error('An error occurred while trying to get page.'),
            () => {})

        return next$
    }

    private receivePage(t: T) {
        const items = this.itemMap(t)
        this._pageInfo = this.pageInfoMap(t)

        this.itemsSubject.next(items)

        this._hasNext = this.hasNext(this._pageInfo)
        this.hasNextSubject.next(this._hasNext)
    }
}