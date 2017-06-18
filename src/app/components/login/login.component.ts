import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {AngularFireDatabase} from 'angularfire2/database';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-email',
  templateUrl: './login.component.html',
})
export class LoginUserComponent implements OnInit {
  loginError = false;
  errorMessage;
  state: string = '';
  error: any;
  user: any;

  users;


  constructor(public afAuth: AngularFireAuth, private db: AngularFireDatabase,
   private router: Router, private userService: UserService) {
    this.user = afAuth.authState;
  }

  onSubmit(formData) {
    if (!formData.valid) {
      return;
    }

    let email = formData.value.email;
    let password = formData.value.password;
    let remember = formData.value.remember;

    console.log('remember' + remember);

    this.afAuth.auth.onAuthStateChanged(
      (user) => console.log(`auth state change ${JSON.stringify(user)}`)
    );

    this.afAuth.auth.signInWithEmailAndPassword( email , password).then(
      (success: firebase.User) => {
        // if (!success.emailVerified) {
        //   this.error = true;
        //   this.errorMessage = 'Please approve your email address.';
        //   this.afAuth.auth.signOut();
        //   return;
        // }

        console.log('cuu fire user', JSON.stringify(success));

        if ( remember ) {
          localStorage.setItem('remember', 'true');
        }

        localStorage.setItem('currFireUser', JSON.stringify(success));

        this.db.list('/users').subscribe(data => {
          const fUser = data.filter(user => user.email.toLowerCase() == email.toLowerCase() )[0];
          if (!fUser) {
            this.loginError = true;
            this.errorMessage = 'User not found in firebase';
            this.logout();
            return;
          }
          console.log('Login seccessful');

          this.userService.addUser(fUser);

          Cookie.set('User', JSON.stringify({
            name: fUser.name,
            email: fUser.email,
            userInfo: fUser,
            firebaseKey: fUser.$key
          }));

          // console.log(userInfo,44);
          // todo redirects check
          this.router.navigate(['/dashboards/main-view']);
        });

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
    Cookie.set('User', null);
    localStorage.removeItem('remember');
    this.router.navigate([ '/login' ]);
  }

  ngOnInit() {
    this.loginError = false;
  }

}
