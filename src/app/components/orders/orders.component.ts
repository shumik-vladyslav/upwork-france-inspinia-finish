import { Component, OnInit } from '@angular/core';
import { footable } from '../../app.helpers';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { NgForm, FormControl, FormGroup, Validators } from '@angular/forms';
import { Cookie } from 'ng2-cookies';
import { AuthGuard } from '../auth.service';

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
  availableProducts;
  shopCart;
  component;
  constructor(component) {
      this.component = component;
      this.orderId = 0;
      this.clientName = '';
      this.status = '';
      this.paid = 'unpaid';
      this.quantity = 0;
      this.priceMethod = [];
      this.notes = '';
      this.statusClass = false;
      this.notes = '';
      this.ticketNumber = '';
      this.date = '';
      this.orderSum = 0;
      this.priceMethod = '';
      this.availableProducts = [];
      this.shopCart = [];
      this.isValid();
  };

  moveToShopCart(i) {
    const pr = this.availableProducts[i];
    pr.bayQt = pr.quantity;
    console.log('pr is not service');
    console.log(JSON.stringify(pr));
    if (pr.isService) {
      console.log('pr.isServece');
      pr.bayQt = 1;
      pr.quantity = 1;
    }
    this.shopCart.push(pr);
    this.availableProducts.splice(i, 1);
    this.recalcOrderSum();

    this.isValid();
  }

  moveToAvail(i) {
    this.availableProducts.push(this.shopCart[i]);
    this.shopCart.splice(i, 1);
    this.recalcOrderSum();
    this.isValid();
  }

  isValid() {
    if (this.shopCart.length <= 0) {
        this.component.invalidProducts = true;
    } else {
        this.component.invalidProducts = false;
    }
  }

  recalcOrderSum() {
    this.orderSum = this.shopCart.reduce((acc, item) => acc += item.price * item.bayQt, 0);
  }
}

@Component({
  selector: 'orders',
  templateUrl: 'orders.template.html'
})

export class OrdersComponent implements OnInit {
  createOrderModel: Order = new Order(this);
  editOrderModel: Order = new Order(this);

  createOrderForm;
  public invalidProducts;
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
  selectedOrderId;

  constructor(public db: AngularFireDatabase,
   private router: Router,
    private route: ActivatedRoute,
    private authServ: AuthGuard) {
    this.orders = db.list(`/shops/${authServ.userId}/orders`);
    this.clients = db.list(`/shops/${authServ.userId}/clients`);
    this.productsFrbsCollection = db.list(`/shops/${authServ.userId}/products`);

    this.db.list(`/shops/${authServ.userId}/orders`).subscribe(snapshots => {

      this.totalOrders = snapshots.length;
    });
  }

  public ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
          this.selectedOrderId = params['id'];
      }
    );
    this.invalidProducts = true;

    this.authServ.fetchUserSettings().subscribe(
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
    // setInterval(() => {
    //   this.invalidProducts = !this.invalidProducts;
    // }, 1000)

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
        this.createOrderModel.availableProducts = snapshots.map(i => {i.bayQt = i.quantity; return i; });
        // this.createOrderModel
        let self = this;
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
                self.invalidProducts = true;
                // this.invalidProducts = !this.invalidProducts;
              } else {
                console.log('tr');
                self.invalidProducts = false;
                // this.invalidProducts = false;
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
      order.statusClass = false;
    }
    order.date = Date.now();
    order.orderSum = 0;
    order.orderId = this.totalOrders;

    delete order.component;

    // save to firebase
    this.orders.push(order);

    // close modal
    $('#create-form').modal('toggle');

    // reset form
    form.resetForm();
    // $('#payMeth').val([]);
    this.createOrderModel = new Order(this);
  }

  onRead(id) {
    this.db.object(`/shops/${this.authServ.userId}/orders/${id}`).subscribe((snapshots: Order) => {
      this.editOrderModel = new Order(this);
      for (var key in snapshots) {
        if (snapshots.hasOwnProperty(key)) {
          var element = snapshots[key];
          this.editOrderModel[key] = element;
        }
      }
      this.editOrderModel.$key = snapshots.$key;

      this.db.list(`/shops/${this.authServ.userId}/products`).subscribe(
        products => {
          const prNames = products.map(e => e.name);
          console.log(prNames);
          const shNamse = this.editOrderModel.shopCart.map(e => e.name);
          console.log(shNamse);

          this.editOrderModel.availableProducts = products
          .filter(i => shNamse.indexOf(i.name)==-1)
          .map(i => {i.bayQt = i.quantity; return i; });
          console.log(this.editOrderModel);

          setTimeout(() => {
            console.log(snapshots.priceMethod);
            // $('#payMeth').val(null);
              $('#payMeth').chosen();
              $('#payMeth').val(snapshots.priceMethod);
              $('#payMeth').trigger('chosen:updated');
              $('#payMeth').on('change', (e) => {
                console.log($('#payMeth').val());
              });
            }
          , 200);
        }
      );
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
    order.quantity = +this.editOrderModel.quantity;
    this.db.list(`/shops/${this.authServ.userId}/products`).subscribe(
      products => {
        // firebase save
        const key = order.$key;
        delete order.$key;
        delete order.component;

        this.orders.update(key, order);
        // to do update products quantity

        // close modal
        $('#edit-form').modal('toggle');

        // reset form
        // form.resetForm();
        $('#payMeth').val([]);
        this.editOrderModel = new Order(this);
      }
    );
  }

  onChangeProduct(event) {
    console.log(event);

  }
}
