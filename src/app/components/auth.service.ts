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
  public userId = null;
  public userInfo = null;
  public userRole = null;

  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router) {


    this.afAuth.authState
    .flatMap( user => {
      this.userId = user.uid;
      this.userInfo = user;
      console.log(`1 userid: ${this.userId} role:${this.userRole}`);
      return this.db.object(`/roles/${this.userId}`);
    })
    .subscribe(
      role => {
        this.userRole = role.role;
        console.log(`2 userid: ${this.userId} role:${this.userRole}`);
      }
    );
  }

  getUserObservable(): Observable<boolean> {
    return this.afAuth.authState
    .flatMap( user => {
      this.userId = user.uid;
      this.userInfo = user;
      return this.db.object(`/roles/${this.userId}`);
    })
    .flatMap(
      role => {
        this.userRole = role.role;
        if (role != null) {
          return Observable.of(true);
        } else {
          return Observable.of(false);
        }
      }
    );
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log('can activate');
    if (route.url && route.url[0]) {
      console.log(route.url[0].path);
    }

    this.getUserObservable();
    if (localStorage.getItem('remember') != null && this.userInfo != null) {
          this.userInfo.getIdToken();
        }
    if (this.userId == null) {
      return this.getUserObservable();
    }

    if ( !route.data  || route.data == null || !route.data['roles'] ) {
      return true;
    }

    if ( route.data ) {
      const roles = route.data['roles'] as Array<string>;
      return (roles == null || roles.indexOf(this.userRole) !== -1);
    }

    return false;
    // return this.afAuth.authState.map(
    //   auth => {
    //     if (!auth || auth == null) {
    //       this.router.navigate([ '/login' ]);
    //       return false;
    //     }

    //     // refresh token
    //     if (localStorage.getItem('remember') != null) {
    //       auth.getIdToken();
    //     }
    //     return true;
    //   }
    // ).take(1);
  }

  getUserSettingsDbRef(): firebase.database.Reference {
    return this.db.database.ref(`users/${this.userId}`);
  }

  fetchUserSettings(): Observable<any> {
    return this.db.object(`users/${this.userId}`);
  }

  updateUserSettings(settings: any) {
    return this.db.object(`users/${this.userId}`).update(settings);
  }

  signOut() {
    this.userId = null;
    this.userInfo = null;
    this.userRole = null;
  }
}
