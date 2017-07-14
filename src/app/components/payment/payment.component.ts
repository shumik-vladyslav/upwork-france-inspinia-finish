import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute, Params} from '@angular/router';

import { Cookie } from 'ng2-cookies';
import { UserService } from '../shared/user.service';
import { AngularFireDatabase, FirebaseObjectObservable} from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthGuard } from '../auth.service';

@Component({
  selector: 'payment',
  templateUrl: 'payment.template.html',
  styleUrls: ['./payments.component.css']
})

export class PaymentComponent implements OnInit {
  options = ['Cash', 'Credit card', 'Check', 'Tickets'];
  optionsMap = [];
  firebaseUserKey;

  user: FirebaseObjectObservable<any>;
  otherSwitch = false;
  otherPriceMethod = '';

  seccessSave = false;
  errorSave = false;
  errorMessage = '';

  ngOnInit(): void {
      this.firebaseUserKey =  this.authServ.userId;

      // initialize checkboxes array
      for (let x = 0; x < this.options.length; x++) {
        this.optionsMap[this.options[x]] = false;
      }

      this.db.object(`users/${this.firebaseUserKey}`).subscribe(
        user => {
          if ( user.availPriceMeth ) {
            this.options = [];
            for (let x = 0; x < user.availPriceMeth.length; x++) {
              this.options.push(user.availPriceMeth[x]);
              this.optionsMap[user.availPriceMeth[x]] = false;
            }
          } else {
             console.log('us havnt ');
            for (let x = 0; x < this.options.length; x++) {
              this.optionsMap[this.options[x]] = false;
            }
          }
          if (!user.priceMethod) {return; }
            user.priceMethod.forEach(element => {
            this.optionsMap[element] = true;
          });
          if (user.otherPriceMethod && user.otherPriceMethod !== '') {
            this.otherSwitch = true;
            this.otherPriceMethod = user.otherPriceMethod;
          } else {
            this.otherSwitch = false;
            this.otherPriceMethod = '';
          }

        },
        error => console.log(`error: ${error.message}`)
      );
  }

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public db: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    private authServ: AuthGuard
    ) {
    }

  onSave() {
    const keys = Object.keys(this.optionsMap);
    // console.log(keys);

    const fieldsForUpdate = {
      availPriceMeth: keys,
      priceMethod: keys.filter((key) => this.optionsMap[key])
    };
    // if (this.otherSwitch) {
    //   fieldsForUpdate['otherPriceMethod'] = this.otherPriceMethod;
    // } else {
    //   fieldsForUpdate['otherPriceMethod'] = '';
    // }

    this.db.list('users').update(this.firebaseUserKey, fieldsForUpdate)
    .then(() => this.seccessSave = true)
    .catch(e => {this.errorSave = true; this.errorMessage = e.message });
  }

  updateCheckedOptions(option, event) {
   this.optionsMap[option] = event.target.checked;
  }

  onAddOtherClick() {
    this.options.push(this.otherPriceMethod);
    this.optionsMap[this.otherPriceMethod] = true;
    this.otherPriceMethod = '';
  }
}
