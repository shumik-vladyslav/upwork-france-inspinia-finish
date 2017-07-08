import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Cookie } from 'ng2-cookies';
import { AngularFireDatabase } from 'angularfire2/database';
// import { FirebaseObjectObservable} from 'angularfire2/database';
// import { FirebaseObjectObservable } from './firebase_object_observable';

@Injectable()
export class AuthGuard implements CanActivate {
  userId;
  userInfo;
  userRole;
  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router
    ) {
    this.fetchUserInfo();
  }

  // fetch user info from local storage
  fetchUserInfo() {
    const json = localStorage.getItem('userInfo');
    if (json) {
      try {
        const userInfo = JSON.parse(json);
        this.userInfo = userInfo;
        this.userId = userInfo.uid;
        this.userRole = userInfo.role;
      } catch (e) {
        console.log('user settings parse error');
        this.router.navigate([ '/login' ]);
      }
    } else {
      this.router.navigate([ '/login' ]);
    }
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (localStorage.getItem('remember') != null && this.userInfo != null) {
      // todo remember
      // this.userInfo.getIdToken();
    }

    if (!this.userInfo) {
      this.fetchUserInfo();
    }

    console.log('can activate');
    if (!route.url || route.url.length === 0) {
      return true;
    } else {
      console.log(route.url[0].path);
    }


    if (
      this.userInfo &&
      this.userInfo.routes &&
      this.userInfo.routes.indexOf(route.url[0].path) === -1
      ) {
      return true;
    } else if (this.userInfo &&
      !this.userInfo.routes) {
        return true;
    }
    return false;
  }

  getUserSettingsDbRef(): firebase.database.Reference {
    return this.db.database.ref(`users/${this.userInfo.uid}`);
  }

  fetchUserSettings(): Observable<any> {
    return this.db.object(`users/${this.userInfo.uid}`);
  }

  updateUserSettings(settings: any) {
    return this.db.object(`users/${this.userInfo.uid}`).update(settings);
  }

  signOut() {
    this.userId = null;
    this.userInfo = null;
    this.userRole = null;
  }
}
