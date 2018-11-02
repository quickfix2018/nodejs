import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { InfiniteScrollerDirective } from './infinite-scroller.directive'

@NgModule({
    imports: [ BrowserModule ],
    exports: [ InfiniteScrollerDirective ],
    declarations: [ InfiniteScrollerDirective ],
    providers: [],
})
export class InfiniteScrollerModule { }
