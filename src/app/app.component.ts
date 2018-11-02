import { Component, OnInit, ViewContainerRef  } from '@angular/core'
import { Router, RoutesRecognized } from '@angular/router'
import { DiagnosticService, ApplicationState } from './_shared'
import { AllRoutes } from './app.routes'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/filter'

import { ToastsManager } from "ng2-toastr/ng2-toastr";

@Component({
    moduleId: module.id,
    selector: 'app-root',
    templateUrl: 'app.component.html',
})
export class AppComponent {
    routeData: any = null
    constructor(
        private appState: ApplicationState,
        private diag: DiagnosticService,
        private router: Router,
        public toastr: ToastsManager,
        vcr: ViewContainerRef
    ) { 
        this.toastr.setRootViewContainerRef(vcr)
    }
    
    ngOnInit() {
        this.diag.logInformation("Application loaded", AppComponent.name)

        this.router.events
            .filter(e => e instanceof RoutesRecognized)
            .subscribe((e: RoutesRecognized) => {
                const currentPath = e.state.root.firstChild.routeConfig.path
                this.routeData = AllRoutes.find(route => route.path === currentPath)
                this.appState.CurrentRouteData = {
                    name: this.routeData.name,
                    description: this.routeData.description,
                    icon: this.routeData.icon,
                    path: currentPath,
                    url: e.state.url
                }
                this.diag.logInformation(`Navigated to '${this.routeData.name}' route.`, AppComponent.name)
            })
    }
}