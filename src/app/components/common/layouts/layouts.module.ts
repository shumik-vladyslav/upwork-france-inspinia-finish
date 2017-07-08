import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouterModule} from '@angular/router';

import {BsDropdownModule} from 'ngx-bootstrap';

import {BasicLayoutComponent} from './basicLayout.component';
import {BlankLayoutComponent} from './blankLayout.component';
import {TopNavigationLayoutComponent} from './topNavigationlayout.component';

import {NavigationComponent} from './../navigation/navigation.component';
import {FooterComponent} from './../footer/footer.component';
import {TopNavbarComponent} from './../topnavbar/topnavbar.component';
import {TopNavigationNavbarComponent} from './../topnavbar/topnavigationnavbar.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import {AdminmessComponent} from '../../adminmess/adminmess.component';

@NgModule({
  declarations: [
    FooterComponent,
    BasicLayoutComponent,
    BlankLayoutComponent,
    NavigationComponent,
    TopNavigationLayoutComponent,
    TopNavbarComponent,
    TopNavigationNavbarComponent,
    // AdminmessComponent
  ],
  imports: [
    BrowserModule,
    RouterModule,
    BsDropdownModule.forRoot(),
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    FooterComponent,
    BasicLayoutComponent,
    BlankLayoutComponent,
    NavigationComponent,
    TopNavigationLayoutComponent,
    TopNavbarComponent,
    TopNavigationNavbarComponent
  ],
})

export class LayoutsModule {}
