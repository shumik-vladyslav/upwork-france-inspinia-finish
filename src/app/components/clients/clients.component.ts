import { Component, OnInit } from '@angular/core';
import { NgForm, FormControl, FormGroup, Validators } from '@angular/forms';
import { footable } from '../../app.helpers';
import { summernote } from '../../app.helpers';
import { slimscroll } from '../../app.helpers';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import {Subject} from 'rxjs/Subject';
import {Router} from '@angular/router';

declare var jQuery:any;
declare var $: any;

@Component({
  selector: 'clients',
  templateUrl: 'clients.template.html'
})
export class ClientsComponent {

  name;
  phone;
  email;
  status;

  id;
  name2;
  phone2;
  email2;
  status2;
  address;
  orderHistory;

  statusClass;
  clients: FirebaseListObservable<any[]>;
  clientsOrders: FirebaseListObservable<any[]>;
  clientsOrdersValue: any[];
  filterOrdersSubject = new Subject();
  filteredOrders: any;

  client;

  newClient:any = {status: 'Enabled'};
  searchClient;

  constructor(public db: AngularFireDatabase, private router: Router) {
    this.clients = db.list('/clients');
    this.clientsOrders = db.list('/orders', {
        query: {
            // orderByChild: 'date',
            //equalTo: this.filterOrdersSubject,
        }
      });
      this.clientsOrders.subscribe(queriedItems => {
        console.log('clientsOrders');
        console.log(queriedItems);
        this.clientsOrdersValue = queriedItems;
      });
  }

  onOrdersHistory(clientName: string) {
    console.log(`onOrdersHistory client:${clientName}`);
    this.filterOrdersSubject.next(clientName);
  }

  public ngOnInit():any {
    footable();
    summernote();
    slimscroll();

  }

  selectedClient: any = {};
  selectedRowIdx = -1;
  onRowClick(i,client){
    console.log(`index =${i}`);
    console.log(JSON.stringify(client));
    this.selectedClient = client;
    this.selectedRowIdx = i;
    this.filteredOrders = this.clientsOrdersValue.filter(order => order.clientName == client.name);
  }

  onAddSubmit(form: NgForm) {
    console.log("onAddSubmit");
    let statusClass;
    if (this.newClient.status == 'Enabled') {
      statusClass = true;
    } else {
      statusClass = false;
    }
    let client = {
      name: this.newClient.name,
      phone: this.newClient.phone? this.newClient.phone: '',
      email: this.newClient.email? this.newClient.email: '',
      status: this.newClient.status,
      address: '',
      orderHistory: '',
      statusClass: statusClass
    }

    $('#create-form').modal('toggle');
    this.clients.push(client);
    form.resetForm();
    // form.controls.status.setValue('Enabled');
    this.newClient = {status: 'Enabled'};
  }

  getClient(keyClient) {
    let key = keyClient;

    this.db.list('/clients').subscribe(snapshots => {

      snapshots.forEach(snapshot => {
        let currentKey = snapshot.$key;
        console.log(currentKey, 554);

        if (key == currentKey) {
          this.id = snapshot.$key;
          this.name2 = snapshot.name;
          this.phone2 = snapshot.phone;
          this.email2 = snapshot.email;
          this.status2 = snapshot.status;
          this.address = snapshot.address;
          this.orderHistory = snapshot.orderHistory;
          //console.log(this.data);
          var markupStr = '' + this.orderHistory;
          $('.summernote').summernote('code', markupStr);
          console.log(`onOrdersHistory client:${snapshot.name}`);
          this.filterOrdersSubject.next(snapshot.name);
          //filter clients orders
          this.filteredOrders = this.clientsOrdersValue.filter(order => order.clientName == snapshot.name);
          console.log(`filteredOrders ${this.filteredOrders}`);
          //
        }
      });
    });

    console.log(key);
    console.log("Выбрать клиента");
  }

  onUpdate(form: NgForm) {
    console.log("onEditSubmit");
    let statusClass;
    if(this.status2 == 'Enabled') {
      statusClass = true;
    } else {
      statusClass = false;
    }
    var markupStrIn = $('.summernote').summernote('code');
    let client = {
      name: this.name2,
      phone: this.phone2,
      email: this.email2,
      status: this.status2,
      address: this.address,
      orderHistory: markupStrIn,
      statusClass: statusClass,
    }

    //close modal
    $('#edit-form').modal('toggle');
    form.resetForm();

    this.clients.update(this.id, client);
  }
}
