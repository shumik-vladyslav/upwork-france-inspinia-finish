import { Component, OnInit,AfterViewInit } from '@angular/core';
import { NgForm, FormControl, FormGroup, Validators } from '@angular/forms';
import { footable } from '../../app.helpers';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import {Router} from '@angular/router';
import { AuthGuard } from '../auth.service';

declare var jQuery: any;
declare var $: any;
declare var FooTable: any;
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
export class ProductsComponent implements OnInit, AfterViewInit {

  createModel = new Product();
  editModel = new Product();
  isEditMode = false;
  products: FirebaseListObservable<any[]>;
  searchProduct;
  // list of categories
  catList = [];

  // shop activity log
  activityLog;

  // disable controll buttons if shop is unpaid
  dsblCtrlBtns = false;
  productsTable = [];

  constructor(
    public db: AngularFireDatabase,
    private router: Router,
    public afAuth: AngularFireAuth,
    private authServ: AuthGuard) {
    if ( authServ.userInfo.status === 'unpaid' ) {
        this.dsblCtrlBtns = true;
    }
    this.products = db.list(`/shops/${this.authServ.userId}/products`);
    this.activityLog = db.list(`/shops/${authServ.userId}/activityLog`);
    this.products.subscribe (
      products => {
        this.productsTable = products;
        setTimeout(() => {
             FooTable.init('.footable');
        }, 400 );
      }
    );
  }

  public ngOnInit(): any {
    // const self = this;
    $('#tags').tagsinput('items');
    // fetch categories
    this.authServ.fetchUserSettings().subscribe(
      st => {
          if (st.categories) {
            this.catList = st.categories;
          }
        }
    );
  }

  ngAfterViewInit() {
  }

  onCreate(form: NgForm) {
    console.log(this.createModel);
    this.createModel.tags = $('#tags').tagsinput('items');

    // firebase
    if ( this.isEditMode ) {
      // update
      this.products.update(this.createModel.$key, this.createModel);
      this.isEditMode = false;
      this.activityLog.push({date: Date.now(), activity: 'update product', key: this.createModel.$key});
    } else {
      // create
      this.products.push(this.createModel);
      this.activityLog.push({date: Date.now(), activity: 'new product'});
    }

    // close modal
    $('#create-form').modal('toggle');

    // reset form
    form.resetForm();
    this.createModel = new Product();
  }

  onGet(firebaseId) {
    $('#tags').tagsinput('removeAll');
    this.db.object(`/shops/${this.authServ.userId}/products/${firebaseId}`).subscribe(
      product => {
        this.isEditMode = true;
        this.createModel = product;

        if (!product.tags) { return; }
        product.tags.forEach(element => {
          $('#tags').tagsinput('add', element.toString());
        });
        $('#tags').tagsinput('refresh');
      },
      error => console.log(`Product fetch error: ${error.message}`)
    );
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
}
