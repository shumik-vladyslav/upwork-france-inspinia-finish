import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {UserService} from './shared/user.service';
import { Cookie } from 'ng2-cookies';

@Injectable()
export class AuthGuard implements CanActivate {
  userAf: Observable<firebase.User>;
  user;

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private userService: UserService) {
    this.userAf = this.afAuth.authState;

    this.userAf.subscribe(data => {
      console.log('auth guard', JSON.stringify(data));
      this.user = data;
    });
  }

  canActivate() {
    this.userAf.subscribe((fuser: firebase.User) => {
      console.log('auth guard can activate', JSON.stringify(fuser));
      console.log(`fuser.emailVerified ${fuser.emailVerified}`);

      // implementation remember me option
      if (localStorage.getItem('remember') != null) {
        fuser.getIdToken();
      }
      this.user = fuser;
    });
    const user = Cookie.getAll()['User'];

    if (user == undefined || user == null || user === 'null') {
      this.router.navigate([ 'login' ]);
      return false;
    }
    return true;
    // this.router.navigate([ '/login' ]);
  }

}
