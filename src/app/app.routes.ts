import { ModuleWithProviders } from '@angular/core'
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home";
import { OrderComponent } from "./order"
import { AuthGuard, AdminAuthGuard, NoAccessComponent } from "./auth"
import { MainLayoutComponent } from "./interactive-designer"
import { LoginComponent, ChangePasswordComponent, LogoutComponent, ProfilePageComponent } from "./account"
import { ScheduleSprayDatesComponent } from './order/schedule-spray-dates/schedule-spray-dates.component';
import { DealerPolicyGuard } from './auth/dealer-policy.guard';
import { DealerContractComponent } from './dealer/dealer-contract/dealer-contract.component';
import { ManageDealerPageComponent } from './dealer/manage/manage-dealer-page.component';
import { DealerProjectionsPageComponent } from './dealer/dealer-projections/dealer-projections-page.component';

const appRoutes = [
  {
    path: "not-authorized",
    name: "Not Authorized",
    description: "",
    component: NoAccessComponent,
    useAsDefault: false,
    parentName: "",
    external: false,
    showInNavigation: false,
    icon: "",
    canActivate: <AuthGuard[]>[]
  },
  {
    path: "account/change-password",
    name: "Change Password",
    description: "",
    component: ChangePasswordComponent,
    useAsDefault: false,
    parentName: "",
    external: false,
    showInNavigation: false,
    icon: "",
    canActivate: [AuthGuard]
  },
  {
    path: "account/profile",
    name: "Profile",
    description: "",
    component: ProfilePageComponent,
    useAsDefault: false,
    parentName: "",
    external: false,
    showInNavigation: true,
    icon: "",
    canActivate: [AuthGuard]
  },
  {
    path: "manage/schedule",
    name: "Schedule Orders",
    description: "",
    component: ScheduleSprayDatesComponent,
    useAsDefault: false,
    parentName: "",
    external: false,
    showInNavigation: false,
    icon: "",
    canActivate: [AdminAuthGuard]
  },
  {
    path: "manage/orders",
    name: "Manage Orders",
    description: "",
    component: OrderComponent,
    useAsDefault: false,
    parentName: "",
    external: false,
    showInNavigation: false,
    icon: "",
    canActivate: [AuthGuard, DealerPolicyGuard]
  },
  {
    path: "external",
    name: "Home",
    description: "Home",
    redirectTo: "",
    useAsDefault: false,
    parentName: "",
    showInNavigation: true,
    external: true,
    icon: "",
    canActivate: <AuthGuard[]>[]
  },
  {
    path: "external/events",
    name: "Events",
    description: "Events",
    redirectTo: "",
    useAsDefault: false,
    parentName: "",
    showInNavigation: true,
    external: true,
    icon: "",
    canActivate: <AuthGuard[]>[]
  },
  {
    path: "external/#standards",
    name: "Our Standards",
    description: "Our Standards",
    redirectTo: "",
    useAsDefault: false,
    parentName: "",
    showInNavigation: true,
    external: true,
    icon: "",
    canActivate: <AuthGuard[]>[]
  },
  {
    path: "external/#models",
    name: "Models",
    description: "Models",
    redirectTo: "",
    useAsDefault: false,
    parentName: "",
    showInNavigation: true,
    external: true,
    icon: "",
    canActivate: <AuthGuard[]>[]
  },
  {
    path: "external/about",
    name: "About Us",
    description: "About Us",
    redirectTo: "",
    useAsDefault: false,
    parentName: "",
    showInNavigation: true,
    external: true,
    icon: "",
    canActivate: <AuthGuard[]>[]
  },
  {
    path: "external/#find-dealer",
    name: "Find a Dealer",
    description: "Find a Dealer",
    redirectTo: "",
    useAsDefault: false,
    parentName: "",
    showInNavigation: true,
    external: true,
    icon: "",
    canActivate: <AuthGuard[]>[]
  },
  {
    path: "",
    name: "root",
    description: "",
    redirectTo: "/model/select",
    useAsDefault: false,
    parentName: "",
    showInNavigation: false,
    pathMatch: 'full',
    external: false,
    icon: "",
    canActivate: <AuthGuard[]>[]
  },
  {
    path: "model/select",
    name: "Build a MB",
    description: "Build a MB",
    component: HomeComponent,
    useAsDefault: true,
    parentName: "",
    showInNavigation: true,
    external: false,
    icon: "",
    canActivate: <AuthGuard[]>[]
  },
  {
    path: "model/:id",
    name: "Build a Boat",
    description: "",
    component: MainLayoutComponent,
    useAsDefault: false,
    parentName: "",
    external: false,
    showInNavigation: false,
    icon: "",
    canActivate: <AuthGuard[]>[]
  }, {
    path: "model/reload/:id",
    name: "Build a Boat",
    description: "",
    redirectTo: "/model/:id",
    useAsDefault: false,
    parentName: "",
    external: false,
    showInNavigation: false,
    icon: "",
    canActivate: <AuthGuard[]>[]
  }, {
    path: "config/:configurationID",
    name: "Design A Boat",
    description: "",
    component: MainLayoutComponent,
    useAsDefault: false,
    parentName: "",
    external: false,
    showInNavigation: false,
    icon: "",
    canActivate: [AuthGuard]
  },
  {
    path: "model",
    name: "Design A Boat",
    description: "",
    component: MainLayoutComponent,
    useAsDefault: false,
    parentName: "",
    external: false,
    showInNavigation: false,
    icon: "",
    canActivate: <AuthGuard[]>[]
  },
  {
    path: "login",
    name: "Login",
    description: "",
    component: LoginComponent,
    useAsDefault: false,
    parentName: "",
    external: false,
    showInNavigation: false,
    icon: "",
    canActivate: <AuthGuard[]>[]
  }, {
    path: "logout",
    name: "Sign Out",
    description: "",
    component: LogoutComponent,
    useAsDefault: false,
    parentName: "",
    external: false,
    showInNavigation: false,
    icon: "",
    canActivate: [AuthGuard]
  }, {
    path: "dealer/contract",
    name: "Dealer Contract",
    description: "",
    component: DealerContractComponent,
    useAsDefault: false,
    parentName: "",
    external: false,
    showInNavigation: false,
    icon: "",
    canActivate: [AuthGuard]
  }, {
    path: "dealer/projections/2019",
    name: "Dealer Projections",
    description: "",
    component: DealerProjectionsPageComponent,
    useAsDefault: false,
    parentName: "",
    external: false,
    showInNavigation: false,
    icon: "",
    canActivate: [AuthGuard]
  }, {
    path: "manage/dealers",
    name: "Dealer Management",
    description: "",
    component: ManageDealerPageComponent,
    useAsDefault: false,
    parentName: "",
    external: false,
    showInNavigation: false,
    icon: "",
    canActivate: [AdminAuthGuard]
  }
]

// Contains all routes, even those not used by the Angular2.
// Primarily used for including navigational elements that have no router interactivity.
export const AllRoutes = appRoutes.concat([])
export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
