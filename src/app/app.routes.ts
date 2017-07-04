import {Routes} from '@angular/router';

import {Dashboard1Component} from './views/dashboards/dashboard1.component';
import {Dashboard2Component} from './views/dashboards/dashboard2.component';
import {Dashboard3Component} from './views/dashboards/dashboard3.component';
import {Dashboard4Component} from './views/dashboards/dashboard4.component';
import {Dashboard41Component} from './views/dashboards/dashboard41.component';
import {Dashboard5Component} from './views/dashboards/dashboard5.component';

import {StarterViewComponent} from './views/appviews/starterview.component';
import {LoginComponent} from './views/appviews/login.component';

import {BlankLayoutComponent} from './components/common/layouts/blankLayout.component';
import {BasicLayoutComponent} from './components/common/layouts/basicLayout.component';
import {TopNavigationLayoutComponent} from './components/common/layouts/topNavigationlayout.component';

import { SignupComponent } from './components/signup/signup.component';
import { LoginUserComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CashComponent } from './components/cash/cash.component';
import { ClientsComponent } from './components/clients/clients.component';
import { EditClientComponent } from './components/clients/edit-client/edit-client.component';
import { ProductsComponent } from './components/products/product.component';
import { EditProductComponent } from './components/products/edit-product/edit-product.component';
import { OrdersComponent } from './components/orders/orders.component';
import { EditOrderComponent } from './components/orders/edit-order/edit-order.component';
import { PreferencesComponent } from './components/preferences/preferences.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ProfilComponent } from './components/profil/profil.component';
import { PaymentComponent } from './components/payment/payment.component';
import { MessagesComponent } from './components/messages/messages.component';
import { AuthGuard } from './components/auth.service';
import { ConfirmEmailComponent } from './components/confirm-email/confirm-email.component';
import { ShopsComponent } from './components/shops/shops.component';
import { UsersComponent } from './components/users/users.component';
import { AdmindashComponent } from './components/admindash/admindash.component';
import { AdminmessComponent } from './components/adminmess/adminmess.component';
import { AdminmailComponent } from './components/adminmail/adminmail.component';
import { ShopcalendarComponent } from './components/shopcalendar/shopcalendar.component';
import { SubscriptionComponent } from './components/subscription/subscription.component';

export const ROUTES: Routes = [
  // Main redirect
  {path: '', redirectTo: 'login', pathMatch: 'full'},


  // App views
  {
    path: 'dashboards', component: BasicLayoutComponent, canActivate: [AuthGuard],
    children: [
      {path: 'main-view', component: DashboardComponent, canActivate: [AuthGuard]},
      {path: 'cash', component: CashComponent},
      {path: 'dashboard1', component: Dashboard1Component, canActivate: [AuthGuard]},
      {path: 'dashboard2', component: Dashboard2Component, canActivate: [AuthGuard]},
      {path: 'dashboard3', component: Dashboard3Component, canActivate: [AuthGuard]},
      {path: 'dashboard4', component: Dashboard4Component, canActivate: [AuthGuard]},
      {path: 'dashboard5', component: Dashboard5Component, canActivate: [AuthGuard]}
    ]
  },
  {
    path: 'preferences', component: BasicLayoutComponent, canActivate: [AuthGuard],
    children: [
      {path: 'profil', component: ProfilComponent, canActivate: [AuthGuard]},
      {path: 'payment', component: PaymentComponent, canActivate: [AuthGuard]},
      {path: 'messages', component: MessagesComponent, canActivate: [AuthGuard]},
      {path: 'subscription', component: SubscriptionComponent, canActivate: [AuthGuard]},
    ]
  },
  {
    path: 'dashboards', component: TopNavigationLayoutComponent,
    children: [
      {path: 'dashboard41', component: Dashboard41Component}
    ]
  },
  {
    path: '', component: BasicLayoutComponent, canActivate: [AuthGuard],
    children: [
      {path: 'starterview', component: StarterViewComponent, canActivate: [AuthGuard]},
      {path: 'clients', component: ClientsComponent, canActivate: [AuthGuard]},
      {path: 'clients/:id', component: EditClientComponent, canActivate: [AuthGuard]},
      {path: 'products', component: ProductsComponent, canActivate: [AuthGuard]},
      {path: 'products/:id', component: EditProductComponent, canActivate: [AuthGuard]},
      {path: 'orders', component: OrdersComponent, canActivate: [AuthGuard]},
      {path: 'calendar', component: ShopcalendarComponent, canActivate: [AuthGuard]},
      {path: 'orders/:id', component: OrdersComponent, canActivate: [AuthGuard]},
      // {path: 'orders/:id', component: EditOrderComponent, canActivate: [AuthGuard]},
      {path: 'preferences', component: PreferencesComponent, canActivate: [AuthGuard]},
      {path: 'projects', component: ProjectsComponent, canActivate: [AuthGuard]},
      // admin panel routes
      {path: 'admindash', component: AdmindashComponent, canActivate: [AuthGuard], data: { roles: ['admin'] }},
      {path: 'shops', component: ShopsComponent, canActivate: [AuthGuard], data: { roles: ['admin'] }},
      {path: 'users', component: UsersComponent, canActivate: [AuthGuard]},
      {path: 'adminmess', component: AdminmessComponent, canActivate: [AuthGuard], data: { roles: ['admin'] }},
      {path: 'adminmail', component: AdminmailComponent, canActivate: [AuthGuard], data: { roles: ['admin'] }},
    ]
  },
  {
    path: '', component: BlankLayoutComponent,
    children: [
      { path: 'login', component: LoginUserComponent },
      { path: 'register', component: SignupComponent },
      { path: 'confemail', component : ConfirmEmailComponent}
    ]
  },

  // Handle all other routes
  //{path: '**',  redirectTo: 'dashboards/main-view'}
];
