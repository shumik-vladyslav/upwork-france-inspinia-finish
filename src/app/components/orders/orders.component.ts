import { Component, OnInit,ViewEncapsulation } from '@angular/core';
import { footable } from '../../app.helpers';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Router, ActivatedRoute, Params} from '@angular/router';
import { NgForm, FormControl, FormGroup, Validators } from '@angular/forms';
import { Cookie } from 'ng2-cookies';
import { AuthGuard } from '../auth.service';

declare var jQuery: any;
declare var $: any;
declare var FooTable: any;

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
  templateUrl: 'orders.template.html',
  styleUrls: ['./orders.template.css'],
  encapsulation: ViewEncapsulation.None
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

  // shop activity log
  activityLog;

  // disable controll buttons if shop is unpaid
  dsblCtrlBtns = false;

  ordersTableSource;
  constructor(public db: AngularFireDatabase,
   private router: Router,
    private route: ActivatedRoute,
    private authServ: AuthGuard) {

    if ( authServ.userInfo.status === 'unpaid' ) {
      this.dsblCtrlBtns = true;
    }
    this.orders = db.list(`/shops/${authServ.userId}/orders`);
    this.orders.subscribe(
      orders => {
        console.log('orders update');
        console.log(orders);
        
        this.ordersTableSource = orders;
        this.totalOrders = orders.length;
        setTimeout(() => {FooTable.init('#footable')} , 500 );
      }
    );
    this.clients = db.list(`/shops/${authServ.userId}/clients`);
    this.productsFrbsCollection = db.list(`/shops/${authServ.userId}/products`);
    this.activityLog = db.list(`/shops/${authServ.userId}/activityLog`);
    // FooTable.init('#footable', {'rows': this.orders.toPromise});
  }

  public ngOnInit(): void {
    this.route.params.subscribe(
      (params: Params) => {
          const key = params['id'];
          if (!key) {return; }
          console.log('idiiididiid');
          
          this.onRead(key);
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
  }

  onCreateDialogShow(): void {
      this.productsFrbsCollection.subscribe(snapshots => {
        this.createOrderModel.availableProducts = snapshots.map(i => {i.bayQt = i.quantity; return i; });
        // this.createOrderModel
        let self = this;
        setTimeout(() => {
            $('#products').chosen();
            $('#products').on('change', function(e) {
              // triggers when whole value changed
              const val = $('#products').val();
              if (!val || val.length == 0 ) {
                console.log('op');
                self.invalidProducts = true;
              } else {
                self.invalidProducts = false;
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
    // order.orderSum = 0;
    order.orderId = this.totalOrders;

    delete order.availableProducts;
    delete order.moveToShopCart;
    delete order.component;
    
    // save to firebase
    this.orders.push(order);
    this.activityLog.push({date: Date.now(), activity: 'new order'});

    // close modal
    $('#create-form').modal('toggle');

    // reset form
    form.resetForm();
    // $('#payMeth').val([]);
    this.createOrderModel = new Order(this);
  }

  onRead(key) {
    $('#edit-form').modal('toggle');
    this.db.object(`/shops/${this.authServ.userId}/orders/${key}`).subscribe((snapshots: Order) => {

      this.editOrderModel  = snapshots;
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
          const shNamse = this.editOrderModel.shopCart.map(e => e.name);

          this.editOrderModel.availableProducts = products
          .filter(i => shNamse.indexOf(i.name) == -1)
          .map(i => {i.bayQt = i.quantity; return i; }); 

          if (this.editOrderModel.shopCart.length !== 0){
            this.invalidProducts = false;
          }
          
          setTimeout(() => {
              console.log(snapshots.priceMethod);
              $('#payMeth').chosen();
              $('#payMeth').val(snapshots.priceMethod);
              $('#payMeth').trigger('chosen:updated');
              $('#payMeth').on('change', (e) => { console.log($('#payMeth').val()); });
              $('.chosen-container').css('width', '100%');
            }
          , 400);
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
    order.priceMethod = $('#payMeth').val();
    order.quantity = +this.editOrderModel.quantity;
    this.db.list(`/shops/${this.authServ.userId}/products`).subscribe(
      products => {
        // firebase save
        const key = order.$key;
        delete order.$key;
        delete order.component;
        delete order.availableProducts;
        delete order.moveToShopCart;

        this.orders.update(key, order);
        this.activityLog.push({date: Date.now(), activity: 'update order', key: key});

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
