import { Component, OnInit, Input } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Rx';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Ng2Summernote } from 'ng2-summernote/ng2-summernote';
import { Cookie } from 'ng2-cookies';
import { UserService } from '../shared/user.service';
import { CountriesCatalog } from './countries';
import { AuthGuard } from '../auth.service';

class User {
  $key;
  name;
  phone;
  email;
  status;
  address;
  country;
  storeName;
  password;
}

@Component({
  selector: 'preferences',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})

export class ProfilComponent implements OnInit {
  userAf: Observable<firebase.User>;
  seccessSave = false;
  errorSave = false;
  errorMessage = '';

  // user settings
  sett;

  // user id
  uid;

  // counties dropdown
  countries = CountriesCatalog;

  //hidden password flag
  hiddPW = false;

  /** URL for upload server images */
  @Input() hostUpload: string;

  /** Uploaded images server folder */
  @Input() uploadFolder = '';

  constructor(
    public db: AngularFireDatabase,
    private authServ: AuthGuard
  ) {
  }

  ngOnInit() {
    this.uid = this.authServ.userInfo.uid;
    this.db.object(`/users/${this.uid}`).subscribe (
      sett => {
        this.sett = sett;
        console.log(sett);
      }
    );
  }

  onEditSubmit() {

    this.db.list(`/users`).update(this.uid, this.sett)
    .then(() => this.seccessSave = true)
    .catch(e => {
      this.errorSave = true;
      this.errorMessage = e.message;
    });
  }

  onChangePW() {
  }
}
