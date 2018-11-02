import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DragDropModule } from 'primeng/primeng';
import { InfiniteScrollerModule } from '../ng-infinite-scroller/infinite-scroller.module'

import { FlowSchedulerComponent, ItemTemplate } from './flowscheduler.component';

@NgModule({
    imports: [ BrowserModule, DragDropModule, InfiniteScrollerModule],
    exports: [ FlowSchedulerComponent, ItemTemplate ],
    declarations: [ FlowSchedulerComponent, ItemTemplate ],
    providers: [ ],
})
export class FlowSchedulerModule { }
