import { Component, OnInit, Input } from '@angular/core';

import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Ng2Summernote } from 'ng2-summernote/ng2-summernote';

@Component({
  selector: 'app-edit-order-component',
  templateUrl: './edit-order.component.html'
})
export class EditOrderComponent implements OnInit {

  id;
  orderId;
  clientName;
  status;
  paid;
  products;
  quantity;
  priceMethod;
  notes;
  ticketNumber;

  orders;
  order;

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
    this.orders = this.db.list('/orders');
    this.order = this.db.object('/orders/'+this.id).subscribe(order => {

      this.clientName = order.clientName;
      this.products = order.products;
      this.quantity = order.quantity;
      this.paid = order.paid;
      this.priceMethod = order.priceMethod;
      this.notes = order.notes;
      this.ticketNumber = order.ticketNumber;
      this.status = order.status;

    });

  }

  onSubmit() {
    this.model.data = this.data;
  }

  onEditSubmit(){
    let order = {
      clientName: this.clientName,
      products: this.products,
      quantity: this.quantity,
      paid: this.paid,
      priceMethod: this.priceMethod,
      notes: this.notes,
      ticketNumber: this.ticketNumber,
      status: this.status,
    }


    this.orders.update(this.id, order);
    this.router.navigate(['/orders']);
  }

}
