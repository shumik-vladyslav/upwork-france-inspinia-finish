import { Component, OnInit } from '@angular/core';
import { NgForm, FormControl, FormGroup, Validators } from '@angular/forms';
import { footable } from '../../app.helpers';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import {Router} from '@angular/router';

declare var jQuery: any;
declare var $: any;

class Product {
  $key;
  name;
  price;
  quantity;
  description;
  category;
  tag;
  constructor() {
    this.name = '';
    this.price = 0;
    this.quantity = 0;
    this.description = '';
    this.category = '';
    this.tag = '';
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

  constructor(public db: AngularFireDatabase, private router:Router) {
    this.products = db.list('/products');
  }

  public ngOnInit(): any {
    footable();
  }

  onCreate(form: NgForm) {
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
}
