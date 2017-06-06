import { Component, OnInit, Input } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Ng2Summernote } from 'ng2-summernote/ng2-summernote';

@Component({
  selector: 'preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent implements OnInit {

  id;
  name;
  phone;
  email;
  status;
  address;
  country;
  storeName;

  users;
  user;

  data: string = 'appendix';

  model: any = {
    data: this.data,
  }


  /** URL for upload server images */
  @Input() hostUpload: string;

  /** Uploaded images server folder */
  @Input() uploadFolder: string = "";

  constructor(
    public db: AngularFireDatabase,
    private router:Router,
    private route:ActivatedRoute
  ) {

  }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    console.log(`this.id ${this.id}`);
    this.users = this.db.list('/users');
    this.user = this.db.object('/users/'+this.id).subscribe(user => {

      this.name = user.name;
      this.phone = user.phone;
      this.email = user.email;
      this.status = user.status;
      this.address = user.address;
      this.country = user.country;
    });


  }

  onSubmit() {
    this.model.data = this.data;
  }

  onEditSubmit(){
    let user = {
      name: this.name,
      phone: this.phone,
      email: this.email,
      status: this.status,
      address: this.address,
      country: this.country,
    }


    this.users.update(this.id, user);
    this.router.navigate(['/clients']);
  }

}
