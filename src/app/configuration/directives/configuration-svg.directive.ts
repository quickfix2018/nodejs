import { Directive, ElementRef, Input, Injectable, OnInit, OnChanges, SimpleChange } from '@angular/core'
import { IConfiguration } from '../iconfiguration'

@Directive({
    selector: '[SvgConfiguration]'
})
export class ConfigurationSvg implements OnInit, OnChanges {
    private el: HTMLElement;

    constructor(el: ElementRef) {
        this.el = el.nativeElement;
    }
    ngOnInit() {
    }
    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        var svgGetDoc = <GetSVGDocument><any>this.el;
        this.el.addEventListener("load", function () {
            var svgDoc = svgGetDoc.getSVGDocument();
            var colorAreaEl = svgDoc.getElementById("gel5-color")
            colorAreaEl.setAttribute("class", "animateToRed")
        })
    }
    @Input('SvgConfiguration') configuration : IConfiguration
}