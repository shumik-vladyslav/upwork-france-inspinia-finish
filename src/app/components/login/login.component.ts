import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import {AngularFireDatabase} from 'angularfire2/database';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies';
import { UserService } from "../shared/user.service";

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
    this.users = db.list('/users');
  }

  onSubmit(formData) {
    if (!formData.valid) {
      return;
    }

    let email = formData.value.email;
    let password = formData.value.password;

    this.afAuth.auth.signInWithEmailAndPassword( email , password).then(
      (success) => {
        this.users.subscribe(data => {
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
    this.router.navigate([ '/login' ]);
  }

  ngOnInit() {
    this.loginError = false;
  }

}
