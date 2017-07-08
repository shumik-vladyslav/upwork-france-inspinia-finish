import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Cookie } from 'ng2-cookies';
import { UserService } from "../../shared/user.service";
import 'jquery-slimscroll';
import { AuthGuard } from '../../auth.service';

declare var jQuery:any;

@Component({
  selector: 'navigation',
  templateUrl: 'navigation.template.html'
})

export class NavigationComponent implements OnInit {
  role;
  user;
  routes;
  constructor(public afAuth: AngularFireAuth,
   private router: Router,
    private userService: UserService,
    private authServ: AuthGuard
    ) {}

  ngOnInit() {
    this.role = this.authServ.userRole;
    this.user = this.authServ.userInfo;
    this.routes = this.authServ.userInfo.routes;
    if (!this.routes || this.routes == null) {
      this.routes = [];
    }
  }

  ngAfterViewInit() {
    jQuery('#side-menu').metisMenu();

    if (jQuery('body').hasClass('fixed-sidebar')) {
      jQuery('.sidebar-collapse').slimscroll({
        height: '100%'
      });
    }
  }

  activeRoute(routename: string): boolean {
    return this.router.url.indexOf(routename) > -1;
  }

  logout() {
    this.afAuth.auth.signOut();
    this.router.navigate([ '/login' ]);
  }

  isCanSee(role1, role2, route) {
    return (this.role === role1 || this.role === role2) && (this.routes.indexOf(route) === -1);
  }
}
