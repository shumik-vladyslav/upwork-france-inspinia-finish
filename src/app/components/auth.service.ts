import { CanActivate, Router } from '@angular/router';
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
  private userId = null;
  private userSettings = null;
  constructor(
    private afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router) {
    this.afAuth.authState.subscribe(
      (user: firebase.User) => {
        if (user && user != null) {
          // save user id
          this.userId = user.uid;

          // fetch user settings
          
          return;
        }
        this.userId = null;
        this.userSettings = null;
      }
    );
  }

// canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
  canActivate() {
    return this.afAuth.authState.map(
      auth => {
        if (!auth || auth == null) {
          this.router.navigate([ '/login' ]);
          return false;
        }

        // refresh token
        if (localStorage.getItem('remember') != null) {
          auth.getIdToken();
        }
        return true;
      }
    ).take(1);
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
  
}
