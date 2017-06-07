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
      this.status = 'Pending';
      this.statusClass = false;
      this.notes = '';
      this.ticketNumber = '';
      this.orderSum = 0;
      this.priceMethod = '';
  };
}

@Component({
  selector: 'orders',
  templateUrl: 'orders.template.html'
})

export class OrdersComponent implements OnInit {
  createOrderModel: Order = new Order();
  editOrderModel: Order = new Order();

  createOrderForm;
  invalidProducts;
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
    setTimeout(() => {
       this.invalidProducts = true;
    }, 5000);
    this.invalidProducts = true;
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
    setInterval(() => {
      this.invalidProducts = !this.invalidProducts;
    }, 1000)

    // setTimeout(() => {
    //   for(let i = 0; i < 12; i++){
    //     let order = new Order();
    //     order.orderId = i + 1;
    //     order.date = new Date(2017, i, i).getTime();
    //     order.orderSum = i + 1;
    //     order.clientName = "JonDirr";
    //     console.log(i, order)
    //     this.orders.update(order.orderSum.toString(), order);
    //   }
    // }, 5000);
  }

  // onChangeProducts() {
  //   console.log("onChangeProducts");

  // }

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
              console.log(this.products);
              const val = $('#products').val();
              if (!val || val.length == 0 ) {
                console.log('op');

                this.invalidProducts = true;
              } else {
                console.log('tr');

                this.invalidProducts = false;
              }
            });
          }
        , 200);
    });
    console.log('toggle');
  }

  onCreate(form: NgForm) {
    // this. = true;
    const order = this.createOrderModel;
    // prepare order object for saving
    order.statusClass = true;
    if ( order.status == 'pending') {
      order.statusClass = true;
    }
    order.date = Date.now();
    order.orderSum = 0;
    order.orderId = this.totalOrders;
    order.products = $('#products').val();

    // save to firebase
    this.orders.push(order);

    // close modal
    $('#create-form').modal('toggle');

    // reset form
    form.resetForm();
    $('#payMeth').val([]);
    this.createOrderModel = new Order();
  }

  onRead(id) {
    this.db.object(`orders/${id}`).subscribe(snapshots => {
      this.editOrderModel = snapshots;
      setTimeout(() => {
          $('#payMeth').val(snapshots.priceMethod);
          // $('#payMeth').trigger('chosen:updated');
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
    order.priceMethod = $('#payMeth').val();
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
        $('#payMeth').val([]);
        this.editOrderModel = new Order();
      }
    );
  }
}
