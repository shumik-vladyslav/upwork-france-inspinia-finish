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

  constructor(public afAuth: AngularFireAuth,
   private router: Router,
    private userService: UserService,
    private authServ: AuthGuard
    ) {}

  ngOnInit() {
    this.getUserCookie();
    this.role = this.authServ.userRole;
  }

  ngAfterViewInit() {
    jQuery('#side-menu').metisMenu();

    if (jQuery("body").hasClass('fixed-sidebar')) {
      jQuery('.sidebar-collapse').slimscroll({
        height: '100%'
      })
    }
  }

  activeRoute(routename: string): boolean{
    return this.router.url.indexOf(routename) > -1;
  }

  logout() {
    this.afAuth.auth.signOut();
    this.router.navigate([ '/login' ]);
    Cookie.set("User", null);
  }

  getUserCookie(){
    this.user =  JSON.parse(Cookie.getAll()['User']);
    if(this.user == null) {
      this.user = {
        name: "Guest"
      };
      this.router.navigate([ '/dashboards/main-view' ]);
    }
  }

}
