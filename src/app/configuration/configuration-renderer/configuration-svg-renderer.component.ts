import { Directive, ElementRef, Component, Input, OnInit, forwardRef, Inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IConfiguration } from '../iconfiguration';
import { ISpecification } from '../../specification';
import { flattenArray, BootstrapObj } from '../../_shared'
import { ResponsiveHelper } from '../../_shared/util'
import { DiagnosticService, ApplicationState } from '../../_shared'
import { Observable } from 'rxjs/Rx'
import 'rxjs/add/observable/fromEvent'


@Component({
    moduleId: module.id,
    selector: 'configuration-svg-renderer',
    templateUrl: 'configuration-svg-renderer.component.html',
    styleUrls: ['configuration-svg-renderer.component.css']
})
export class ConfigurationSvgRenderer extends ResponsiveHelper implements OnInit {
    @Input() specification: ISpecification
    @Input() view: string
    @Input() set navigation(displayName: string) {
        if (displayName === "Upholstery") {
            this.setView("interiorSvg")
            this.setMobileView("mobileInteriorSvg")
            this.currentMobileView = "Interior"
            this.nextMobileView = (this.currentMobileView === "Exterior") ? "Interior" : "Exterior"
        }
        if (displayName === "Gelcoat") {
            this.setView("exteriorSvg")
            this.setMobileView("mobileExteriorSvg")
            this.currentMobileView = "Exterior"
            this.nextMobileView = (this.currentMobileView === "Exterior") ? "Interior" : "Exterior"
        }
    }
    @Input() set configuration(config: IConfiguration) {
        this.prevConfiguration = config
        this.diag.logInformation("Receiving configuration.", ConfigurationSvgRenderer.name)
        // TODO:
        this.runAgainstVisibleViews(el => this.pushOrDefer(el, config))
    }

    viewElementIds = [
        "exteriorSvg",
        "interiorSvg",
        "mobileExteriorSvg",
        "mobileInteriorSvg"
    ]

    isVisible(el: HTMLElement) {
        return !!el && el.offsetWidth !== 0 && el.offsetHeight !== 0
    }

    runAgainstVisibleViews(callback: (el: HTMLElement) => void) {
        this.viewElementIds
            .map(id => this.el.ownerDocument.getElementById(id))
            .filter(el => this.isVisible(el))
            .forEach(el => callback(el));
    }

    pushOrDefer(iframe: HTMLElement, config: IConfiguration) {
        if ((<any>iframe).contentWindow && (<any>iframe).contentWindow.applyConfiguration) {
            this.pushConfig(iframe, config)
        } else {
            Observable
                .fromEvent(iframe, "load")
                .subscribe(e => this.pushConfig(iframe, config))
        }
    }

    resetOrDefer(iframe: HTMLElement) {
        if ((<any>iframe).contentWindow && (<any>iframe).contentWindow.clear) {
            this.resetConfig(iframe)
        } else {
            Observable
                .fromEvent(iframe, "load")
                .subscribe(e => this.resetConfig(iframe))
        }
    }

    //TODO: need to address later
    prevConfiguration: IConfiguration
    baseRendererUrl: string = "/svgrenderer/render";
    exteriorUrl: SafeResourceUrl
    interiorUrl: SafeResourceUrl
    mobileExteriorUrl: SafeResourceUrl
    mobileInteriorUrl: SafeResourceUrl
    activeId: string = "exteriorSvg"
    activeMobileId: string = 'mobileExteriorSvg'
    public currentMobileView: string = "Exterior"
    public nextMobileView: string = "Interior"
    private el: HTMLElement
    public bootstrapObj: BootstrapObj

    constructor(
        private sanitizer: DomSanitizer,
        @Inject(forwardRef(() => DiagnosticService)) private diag: DiagnosticService,
        @Inject(forwardRef(() => ApplicationState)) private appState: ApplicationState,
        el: ElementRef
    ) {
        super()
        this.bootStrapObj$.subscribe(obj => this.bootstrapObj = obj)
        this.el = el.nativeElement
    }

    ngOnInit() {
        this.exteriorUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.baseRendererUrl}/${this.specification.ID}/Exterior`)
        this.interiorUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.baseRendererUrl}/${this.specification.ID}/Interior`)
        this.mobileExteriorUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.baseRendererUrl}/${this.specification.ID}/Exterior/sm`)
        this.mobileInteriorUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.baseRendererUrl}/${this.specification.ID}/Interior/sm`)

        this.appState
            .onResetChildrenConfiguration
            .subscribe(() =>
                this.runAgainstVisibleViews(el => this.resetOrDefer(el))
            )

        this.appState
            .configuration$
            .subscribe(config => {
                this.prevConfiguration = config
                this.diag.logInformation("Receiving configuration.", ConfigurationSvgRenderer.name)
                // TODO:
                this.runAgainstVisibleViews(el => this.pushOrDefer(el, config))
            });

        this.runAgainstVisibleViews(el => this.pushOrDefer(el, this.prevConfiguration))
    }


    pushConfig(el: HTMLElement, config: IConfiguration) {
        (<any>el).contentWindow.applyConfiguration(config.Items);
    }

    resetConfig(el: HTMLElement) {
        (<any>el).contentWindow.clear();
    }

    toggleView(event: any) {
        let newActiveId = (this.activeId === "exteriorSvg") ? "interiorSvg" : "exteriorSvg"
        this.setView(newActiveId)
    }

    setView(view: string) {
        if (this.activeId === view) {
            return
        }

        let newActiveId = (this.activeId === "exteriorSvg") ? "interiorSvg" : "exteriorSvg"

        let newActiveEl = this.el.ownerDocument.getElementById(newActiveId)
        let newInactiveEl = this.el.ownerDocument.getElementById(this.activeId)

        newActiveEl.classList.add("active")
        setTimeout(() => {
            newActiveEl.classList.remove("thumbnail")
            newInactiveEl.classList.remove("active")
            newInactiveEl.classList.add("thumbnail")
        }, 1200)

        this.activeId = newActiveId
    }

    setMobileView(view: string) {
        if (this.activeMobileId === view || this.bootstrapObj.Size !== 'xs') {
            return
        }

        let newActiveId = (this.activeMobileId === "mobileExteriorSvg") ? "mobileInteriorSvg" : "mobileExteriorSvg"

        let newActiveEl = this.el.ownerDocument.getElementById(newActiveId)
        let newInactiveEl = this.el.ownerDocument.getElementById(this.activeMobileId)

        newActiveEl.classList.add("active")
        newActiveEl.classList.remove("hidden")
        newInactiveEl.classList.remove("active")
        newInactiveEl.classList.add("hidden")

        this.pushConfig(newActiveEl, this.prevConfiguration)

        this.activeMobileId = newActiveId
    }

    toggleMobileView(event: any) {
        this.nextMobileView = this.currentMobileView
        this.currentMobileView = (this.currentMobileView === "Exterior") ? "Interior" : "Exterior"
        this.setMobileView(`mobile${this.currentMobileView}Svg`)
    }
}