import { CanActivate, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import {AngularFireAuth} from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Cookie } from 'ng2-cookies';

@Injectable()
export class UserService {
  user = {};

  constructor() {

  }

  addUser(userInfo) {
    this.user = {
      email: userInfo.email
    }
  }
  getUser() {
    return this.user;
  }

  getUserCookie(){
    let userCookie = JSON.parse(Cookie.getAll()['User']);
    if(userCookie) {
      return JSON.parse(Cookie.getAll()['User'])
    } else {
      console.log("Вы вошли как гость!");
      return true;
    }
  }

}
