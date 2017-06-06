import { Component, OnInit } from '@angular/core';
import { footable } from '../../app.helpers';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import {Router} from '@angular/router';
import { NgForm, FormControl, FormGroup, Validators } from '@angular/forms';
import { Cookie } from 'ng2-cookies';

declare var jQuery: any;
declare var $: any;

export class Order {
  // firabase key
  $key;

  orderId;
  clientName;
  status;
  paid;
  products;
  quantity;
  priceMethod;
  notes;
  ticketNumber;
  date;
  orderSum;
  statusClass;

  constructor() {
      this.quantity = 0;
      this.paid = 'unpaid';
      this.status = 'pending';
      this.statusClass = false;
      this.notes = '';
      this.ticketNumber = '';
      this.orderSum = 0;
  };
}

@Component({
  selector: 'orders',
  templateUrl: 'orders.template.html'
})

export class OrdersComponent implements OnInit {
  createOrderModel: Order = new Order();
  editOrderModel: Order = new Order();

  totalOrders;
  searchOrder;

  orders: FirebaseListObservable<any[]>;
  clients: FirebaseListObservable<any[]>;
  productsFrbsCollection: FirebaseListObservable<any[]>;
  productsNames: any[];
  firebaseUserKey;

  userPriceMethods;
  selectedPayMethods;
  selectedValue;
  priceMethods;
  selectedPriceMethos;
prNames;
  constructor(public db: AngularFireDatabase, private router:Router) {
    this.orders = db.list('/orders');
    this.clients = db.list('/clients');
    this.productsFrbsCollection = db.list('/products');

    this.db.list('/orders').subscribe(snapshots => {

      this.totalOrders = snapshots.length;
      console.log(`orders totalOrders ${this.totalOrders}`);

    });
  }

  public ngOnInit(): void {
    this.firebaseUserKey =  JSON.parse(Cookie.getAll()['User']).firebaseKey;
    this.db.object(`users/${this.firebaseUserKey}`).subscribe(
        user => {
          if (!user.priceMethod) {return; }
          this.priceMethods = user.priceMethod.map(item => {return {label: item, value:item};});

          if (user.otherPriceMethod && user.otherPriceMethod !== '') {
            this.priceMethods.push({label: user.otherPriceMethod, value: user.otherPriceMethod});
          }
          $('#method').chosen({disable_search_threshold: 10});
        },
        error => console.log(`error: ${error.message}`)
      );
    footable();
  }

  onCreateDialogShow(): void {
      this.productsFrbsCollection.subscribe(snapshots => {
        this.productsNames = snapshots;
        setTimeout(() => {
            // $('#products').val(['while', 'erere']);
            console.log($('#products').val());

            // $('#products').trigger('chosen:updated');
            $('#products').chosen();
            $('#products').on('change', function(e) {
              // triggers when whole value changed
              console.log($('#products').val());
            });
          }
        , 200);
    });
    console.log('toggle');
  }

  onCreate(form: NgForm) {
    const order = this.createOrderModel;
    // prepare order object for saving
    order.statusClass = true;
    if ( order.status == 'pending') {
      order.statusClass = false;
    }
    order.date = Date.now();
    order.orderSum = 500;
    order.orderId = this.totalOrders;
    order.products = $('#products').val();

    // save to firebase
    this.orders.push(order);

    // close modal
    $('#create-form').modal('toggle');

    // reset form
    form.resetForm();
    this.createOrderModel = new Order();
  }

  onRead(id) {
    this.db.object(`orders/${id}`).subscribe(snapshots => {
      this.editOrderModel = snapshots;
      setTimeout(() => {
          $('#payMeth').val(snapshots.priceMethod);
          $('#payMeth').trigger('chosen:updated');
          $('#payMeth').chosen();
          $('#payMeth').on('change', (e) => {
            console.log($('#payMeth').val());
          });
        }
      , 200);
    });
  }

  onUpdate(form: NgForm) {
    const order = this.editOrderModel;
    // prepare order object for saving
    order.statusClass = true;
    if ( order.status == 'pending') {
      order.statusClass = false;
    }
    console.log(order.products);
    this.db.list('products').subscribe(
      products => {
        // get summary price
        let priceSumm = products
        .filter(item => order.products.includes(item.name))
        .reduce((acc, item) => acc += +item.price, 0);
        console.log(`price summary : ${priceSumm}`);
        
        order.orderSum = this.editOrderModel.quantity * priceSumm;

        // firebase save
        this.orders.update(order.$key, order);

        // close modal
        $('#edit-form').modal('toggle');

        // reset form
        form.resetForm();
        this.editOrderModel = new Order();
      }
    );
  }
}
