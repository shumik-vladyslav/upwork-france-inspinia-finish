import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {AngularFireDatabase} from 'angularfire2/database';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Cookie } from 'ng2-cookies';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-email',
  templateUrl: './login.component.html',
})
export class LoginUserComponent implements OnInit {
  loginError = false;
  errorMessage;
  actionSeccessful = false;
  successMessage;

  state: string = '';
  error: any;
  user: any;

  users;


  constructor(
    public afAuth: AngularFireAuth,
    private db: AngularFireDatabase,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private userService: UserService) {
    this.user = afAuth.authState;
  }

  ngOnInit() {
    this.loginError = false;
    // subscribe to router event
    this.activatedRoute.queryParams.subscribe(
      (params: Params) => {
        if (!params) {return; }
        const mode = params['mode'];
        const oobCode = params['oobCode'];
        const apiKey = params['apiKey'];
        console.log(params, mode, oobCode, apiKey);
        if (mode && oobCode && mode === 'verifyEmail' ) {
          this.afAuth.auth.applyActionCode(oobCode)
          .then(
            () => {
              console.log('applyActionCode then');
              this.actionSeccessful = true;
              this.successMessage = 'Email confirmed';
            }
          )
          .catch(
            (e) => {
              console.log('applyActionCode catch');
              this.loginError = true;
              this.errorMessage = e.message;
            }
          );
        }
        console.log(mode, oobCode, apiKey);
      });
  }

  subscribeOnAuthState () {
    this.afAuth.authState.subscribe (
      user => {
        if (!user) {
          console.log('user not logined');
          localStorage.removeItem('remember');
          localStorage.removeItem('userInfo');
          return;
        }
        this.db.object(`/users/${user.uid}`).subscribe (
          fUser => {
            console.log('user info changes');
            fUser.uid = user.uid;
            localStorage.setItem('userInfo', JSON.stringify(fUser));
          });
      }
    );
  }

  onSubmit(formData) {
    if (!formData.valid) {
      return;
    }

    let email = formData.value.email;
    let password = formData.value.password;
    let remember = formData.value.remember;

    console.log('remember' + remember);

    // this.afAuth.auth.onAuthStateChanged(
    //   (user) => console.log(`auth state change ${JSON.stringify(user)}`)
    // );
    this.subscribeOnAuthState();
    this.afAuth.auth.signInWithEmailAndPassword( email , password).then(
      (success: firebase.User) => {

        // email not verified
        if (!success.emailVerified) {
          this.router.navigate(['confemail']);
          this.afAuth.auth.signOut();
          return;
        }

        // remember me
        if ( remember ) {
          localStorage.setItem('remember', 'true');
        } else {
          localStorage.removeItem('remember');
        }

        // localStorage.setItem('currFireUser', JSON.stringify(success));

        this.db.object(`/users/${success.uid}`).subscribe (
          fUser => {
            console.log('Login seccessful');
            fUser.uid = success.uid;
            localStorage.setItem('userInfo', JSON.stringify(fUser));
          // this.userService.addUser(fUser);

          // Cookie.set('User', JSON.stringify({
          //   name: fUser.name,
          //   email: fUser.email,
          //   userInfo: fUser,
          //   firebaseKey: fUser .$key
          // }));
          console.log('asdasd'); 
          
            console.log(fUser.role);
            if (fUser.role =='admin' || fUser.role =='admin-user') {
              this.router.navigate(['/admindash']);
            } else {
              this.router.navigate(['/dashboards/main-view']);
            }
          },
          error => {
            this.loginError = true;
            this.errorMessage = 'User not found in firebase';
            this.logout();
            return;
          }
        );
      }).catch(
      (err) => {
        this.error = err;
        this.loginError = true;
        this.errorMessage = err.message;
      });
  }


  logout() {
    console.log('logout');
    this.afAuth.auth.signOut();
    // Cookie.set('User', null);
    localStorage.removeItem('remember');
    localStorage.removeItem('userInfo');
    this.router.navigate([ '/login' ]);
  }
}
