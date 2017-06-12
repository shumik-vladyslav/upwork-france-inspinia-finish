import { Component, OnInit } from '@angular/core';
import { NgForm, FormControl, FormGroup, Validators } from '@angular/forms';
import { footable } from '../../app.helpers';
import { summernote } from '../../app.helpers';
import { slimscroll } from '../../app.helpers';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import {Subject} from 'rxjs/Subject';
import {Router} from '@angular/router';

declare var jQuery: any;
declare var $: any;

export class Client {
  $key;
  name;
  phone;
  email;
  status;
  address;
  statusClass;
  date;

  console () {
    this.name = '';
    this.phone = '';
    this.email = '';
    this.status = 'Enabled';
    this.address = '';
    this.statusClass = true;
    this.date = Date.now();
  }
}

@Component({
  selector: 'clients',
  templateUrl: 'clients.template.html'
})

export class ClientsComponent {

  crClientModel = new Client();
  edClientModel = new Client();

  orderHistory;

  statusClass;
  clients: FirebaseListObservable<any[]>;
  clientsOrders: FirebaseListObservable<any[]>;
  clientsOrdersValue: any[];
  filterOrdersSubject = new Subject();
  filteredOrders: any;

  client;

  newClient: any = {status: 'Enabled'};
  searchClient;

  selectedClient: any = {};
  selectedRowIdx = -1;

  constructor(public db: AngularFireDatabase, private router: Router) {
    this.clients = db.list('/clients');
    this.clientsOrders = db.list('/orders');

    this.clientsOrders.subscribe(queriedItems => {
      this.clientsOrdersValue = queriedItems;
    });
  }

  onOrdersHistory(clientName: string) {
    this.filterOrdersSubject.next(clientName);
  }

  ngOnInit (): any {
    footable();
    summernote();
    slimscroll();
  }

  onRowClick(i, client) {
    this.selectedClient = client;
    this.selectedRowIdx = i;
    this.filteredOrders = this.clientsOrdersValue.filter(order => order.clientName == client.name);
  }

  onCreate(form: NgForm) {
    const client = this.crClientModel;
    client.date = Date.now();
    // prepare order object for saving
    client.statusClass = true;
    if ( client.status === 'Disabled') {
      client.statusClass = false;
    }

    // send to firebase
    this.clients.push(client);

    // close modal
    $('#create-form').modal('toggle');

    // reset form
    form.resetForm();
    this.crClientModel = new Client();
  }

  onGet(keyClient) {
    this.db.object(`/clients/${keyClient}`).subscribe(snapshot => {
          this.edClientModel = snapshot;

          // filter clients orders
          this.filteredOrders = this.clientsOrdersValue.filter(order => order.clientName == snapshot.name);
    });
  }

  onUpdate(form: NgForm) {
    const client = this.edClientModel;

    // prepare order object for saving
    client.statusClass = true;
    if ( client.status === 'Disabled') {
      client.statusClass = false;
    }

    // send to firebase
    this.clients.update(client.$key, client);

    // close modal
    $('#edit-form').modal('toggle');

    // reset form
    form.resetForm();
    this.edClientModel = new Client();
  }
}
