import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Router } from '@angular/router';
import { shopTestData } from '../../data/shoptestdata';

class Shop {
  name;
  manager;
  products;
  clients;
  orders;
  constructor() {
    this.name = '';
    this.manager = {};
    this.products = [];
    this.clients = [];
    this.orders = [];
  }
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',

})
export class SignupComponent implements OnInit {

  state: string = '';
  error: any;

  users;
  signUpError =false;
  success = false;
  alertMessage;

  constructor(public afAuth: AngularFireAuth, public db: AngularFireDatabase, private router: Router) {
    this.users = db.list('/users');
  }

  onSubmit(formData) {
    if(formData.valid) {
      let name =  formData.value.name;
      let email= formData.value.email;
      let password =  formData.value.password;
      this.afAuth.auth.createUserWithEmailAndPassword(email, password).then(
        (authUser: firebase.User) => {
          this.db.list('users').update(authUser.uid, {
            name: name,
            email: email,
            status: 'unpaid',
            role: 'manager'
          });

          // create shop
          this.createShop(authUser.uid, name);

          // crete role
          this.createRole(authUser.uid);

          authUser.sendEmailVerification()
          .then( () => {
            this.router.navigate(['confemail']);
            console.log('email sendet');
            return;
          }
          ).catch(
            () => console.log('erroremail sendet')
          );
        }).catch(
        (err) => {
          this.signUpError = true;
          this.alertMessage = err;
          this.error = err;
        });
    }
  }

  ngOnInit() {
  }

  createShop(uid, name) {
    const model = new Shop();
    model.name = `${name}\`s shop`;
    model.manager = {name: name, uid: uid };

    model.products = shopTestData.products;
    model.clients = shopTestData.clients;
    model.orders = shopTestData.orders;

    this.db.list('/shops').update(uid, model);
  }

  createRole(uid) {
    this.db.list('/roles').update(uid, {role: 'manager'});
  }
}
