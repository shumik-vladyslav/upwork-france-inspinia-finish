import { Component, OnInit, Input } from '@angular/core';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Ng2Summernote } from 'ng2-summernote/ng2-summernote';

@Component({
  selector: 'app-edit-product-component',
  templateUrl: './edit-product.component.html'
})
export class EditProductComponent implements OnInit {

  id;
  name;
  price;
  quantity;
  description;
  category;
  tag;

  products;
  product;

  data: string = 'appendix';

  model: any = {
    data: this.data,
  }

  @Input() height: number;
  @Input() minHeight: number;
  @Input() maxHeight: number;
  @Input() placeholder: string;
  @Input() focus: boolean;
  @Input() airMode: boolean;
  @Input() dialogsInBody: string;
  @Input() editable: boolean;
  @Input() disableResizeEditor: string;
  @Input() serverImgUp: boolean;
  @Input() config: any;

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
    this.products = this.db.list('/products');
    this.product = this.db.object('/products/'+this.id).subscribe(product => {

      this.name = product.name;
      this.price = product.price;
      this.quantity = product.quantity;
      this.description = product.description;
      this.category = product.category;
      this.tag = product.tag;

    });

  }

  onSubmit() {
    this.model.data = this.data;
  }

  onEditSubmit(){
    let client = {
      name: this.name,
      price: this.price,
      quantity: this.quantity,
      description: this.description,
      category: this.category,
      tag: this.tag,
    }


    this.products.update(this.id, client);
    this.router.navigate(['/products']);
  }

}
