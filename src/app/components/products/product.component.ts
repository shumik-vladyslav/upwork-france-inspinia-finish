import { Component, OnInit } from '@angular/core';
import { NgForm, FormControl, FormGroup, Validators } from '@angular/forms';
import { footable } from '../../app.helpers';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import {Router} from '@angular/router';
import { AuthGuard } from '../auth.service';

declare var jQuery: any;
declare var $: any;

class Product {
  $key;
  name;
  price;
  quantity;
  description;
  category;
  tags;
  isService;
  stockAlert;
  constructor() {
    this.name = '';
    this.price = 0;
    this.quantity = 0;
    this.description = '';
    this.category = '';
    this.tags = [];
    this.isService = false;
    this.stockAlert = 100;
  }
};

@Component({
  selector: 'products',
  templateUrl: 'products.template.html'
})
export class ProductsComponent implements OnInit {

  createModel = new Product();
  editModel = new Product();

  products: FirebaseListObservable<any[]>;
  searchProduct;
  // list of categories
  catList = [];

  constructor(
    public db: AngularFireDatabase,
    private router: Router,
    public afAuth: AngularFireAuth,
    private authServ: AuthGuard) {
    this.products = db.list('/products');
  }

  public ngOnInit(): any {
    // const self = this;
    footable();
    
    // fetch categories
    this.authServ.fetchUserSettings().subscribe(
      st => {
          if (st.categories) {
            this.catList = st.categories;
          }
        }
    );
    // $('#tags').on('itemAdded', function(event) {
    //   self.createModel.tags.push(event.item);
    // });

    // $('#tags').on('itemRemoved', function(event) {
    //   const pos = self.createModel.tags.indexOf(event.item);
    //   self.createModel.tags.splice(pos, 1);
    // });

  }

  onCreate(form: NgForm) {
    console.log(this.createModel);
    this.createModel.tags = $('#tags').tagsinput('items');
    // firebase create
    this.products.push(this.createModel);

    // close modal
    $('#create-form').modal('toggle');

    // reset form
    form.resetForm();
    this.createModel = new Product();
  }

  onGet(firebaseId) {
    this.db.object(`products/${firebaseId}`).subscribe(
      product => this.editModel = product,
      error => console.log(`Product fetch error: ${error.message}`)
    );
  }

  onUpdate(form: NgForm) {
    // firebase update
    this.products.update(this.editModel.$key, this.editModel);

    // close modal
    $('#edit-form').modal('toggle');

    // reset form
    form.resetForm();
    this.editModel = new Product();
  }

  addCategory() {
    console.log('addCategory');
    const cat = this.createModel.category;

    if (this.catList.indexOf(cat) !== -1) {
      return;
    }
    this.catList.push(cat);
    this.createModel.category = '';
    // save to firebase
    this.authServ.updateUserSettings({categories: this.catList});
  }

  onChangeTags() {
    console.log('onChangeTags()');
    console.log(this.createModel.tags);
  }
}
