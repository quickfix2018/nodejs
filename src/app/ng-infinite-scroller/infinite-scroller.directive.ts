import { Directive, ElementRef, Input, OnDestroy, AfterContentInit } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subscription } from 'rxjs/Subscription';

interface ScrollPosition {
    sT: number,
    sH: number,
    cH: number
}

const DEFAULT_SCROLL_POSITION: ScrollPosition = {
    sT: 0,
    sH: 0,
    cH: 0
}

@Directive({
    selector: '[scroller]'
})
export class InfiniteScrollerDirective implements AfterContentInit, OnDestroy {
    constructor(
        private el: ElementRef
    ){ }

    @Input()
    public scrollPercent = 90

    @Input()
    public immediateCallback = false

    @Input()
    public useDocument = false

    @Input()
    public scrollCallback: () => Observable<any> = () => Observable.interval(1).first()

    private requestOnScrollSub: Subscription

    ngAfterContentInit() {
        const scrollEl = this.useDocument ? this.el.nativeElement.ownerDocument : this.el.nativeElement

        const scroll$ = Observable
            .fromEvent(scrollEl, 'scroll')
            .map((e: any) => this.useDocument ? e.target.documentElement : e.target)

        const touch$ = Observable
            .fromEvent(scrollEl, 'touchmove')
            .map((e: any) => window.document.documentElement)

        const scrollEvent$ = Observable
            .merge(scroll$, touch$)

        const scrollDown$ = scrollEvent$
            .map((target: any): ScrollPosition => ({
                sT: target.scrollTop,
                sH: target.scrollHeight,
                cH: target.clientHeight
            }))
            .pairwise()
            .filter(ps => ps[0].sT < ps[1].sT)
            .filter(ps => ((ps[0].sT + ps[0].cH) / ps[0].sH) > (this.scrollPercent / 100))

        const requestOnScroll$ =
            this.immediateCallback
            ? scrollDown$.startWith([DEFAULT_SCROLL_POSITION, DEFAULT_SCROLL_POSITION])
            : scrollDown$;

        this.requestOnScrollSub = requestOnScroll$
            .exhaustMap(_ => this.scrollCallback())
            .subscribe(() => { });
    }

    ngOnDestroy() {
        if (this.requestOnScrollSub) { this.requestOnScrollSub.unsubscribe() }
    }
}