import { Component, OnInit, Input } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Rx';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Ng2Summernote } from 'ng2-summernote/ng2-summernote';
import { Cookie } from 'ng2-cookies';
import { UserService } from "../shared/user.service";
import { CountriesCatalog } from './countries';
@Component({
  selector: 'preferences',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.css']
})
export class ProfilComponent implements OnInit {

  userAf: Observable<firebase.User>;
  id;
  name;
  phone;
  email;
  status;
  address;
  country;
  storeName;
  password;

  users;
  user;
  obj;

  userId;

  seccessSave = false;
  errorSave = false;
  errorMessage = '';

  // counties dropdown
  countries = CountriesCatalog;

  //hidden password flag
  hiddPW = false;

  /** URL for upload server images */
  @Input() hostUpload: string;

  /** Uploaded images server folder */
  @Input() uploadFolder = '';

  constructor(
    public afAuth: AngularFireAuth,
    public db: AngularFireDatabase,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {
    this.userAf = this.afAuth.authState;
    this.users = db.list('/users');
  }

  ngOnInit() {
    // this.hiddPW = true;
    this.id = this.route.snapshot.params['id'];
    this.users = this.db.list('/users');
    this.user =  this.db.list('/users').subscribe(users => {

      let userId = JSON.parse(Cookie.getAll()['User']);
      users.forEach(snapshot => {

        if(snapshot.email == userId.email) {

          this.id = snapshot.$key;
          this.name = snapshot.name;
          this.phone = snapshot.phone;
          this.email = snapshot.email;
          this.status = snapshot.status;
          this.address = snapshot.address;
          this.country = snapshot.country;
          this.password = snapshot.password;
        }

      });
    });

    this.obj = this.userService.getUser();
  }


  onEditSubmit(){
    let user = {
      name: this.name,
      //phone: this.phone,
      email: this.email,
      //status: this.status,
      //address: this.address,
      //country: this.country,
    }


    this.users.update(this.id, user)
    .then(() => this.seccessSave = true)
    .catch(e => {this.errorSave = true; this.errorMessage = e.message });

    let userId = JSON.parse(Cookie.getAll()['User']);
    userId.name = this.name;
    Cookie.set('User', JSON.stringify(userId));
  }
  onChangePW() {
    
  }
}
