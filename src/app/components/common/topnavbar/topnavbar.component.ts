import { Component } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies';
import { smoothlyMenu } from '../../../app.helpers';
declare var jQuery:any;
import { AuthGuard } from '../../auth.service';

@Component({
  selector: 'topnavbar',
  templateUrl: 'topnavbar.template.html'
})
export class TopNavbarComponent {

  constructor(public afAuth: AngularFireAuth,
   private router: Router,
   private authServ: AuthGuard) {

  }

  toggleNavigation(): void {
    jQuery("body").toggleClass("mini-navbar");
    smoothlyMenu();
  }

  logout() {
    this.router.navigate([ '/login' ]);
    this.authServ.signOut();
    this.afAuth.auth.signOut();
    Cookie.set("User", null);
  }

  login() {
    this.router.navigate([ '/login' ]);
  }

}
