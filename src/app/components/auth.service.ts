import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {UserService} from "./shared/user.service";
import { Cookie } from 'ng2-cookies';

@Injectable()
export class AuthGuard implements CanActivate {
  userAf: Observable<firebase.User>;
  user;

  constructor(private afAuth: AngularFireAuth, private router: Router, private userService: UserService) {
    this.userAf = this.afAuth.authState;

    this.userAf.subscribe(data => {
      this.user = data;
    });
  }

  canActivate(){
    if (Cookie.getAll()['User']) {
      return true;
    } else {
      this.router.navigate([ '/login' ]);
    }
  }

}
