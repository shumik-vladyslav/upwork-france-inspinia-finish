import { Component, OnInit, Input } from '@angular/core';
import { summernote } from '../../../app.helpers';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import {Router, ActivatedRoute, Params} from '@angular/router';
import { Ng2Summernote } from 'ng2-summernote/ng2-summernote';

declare var JQuery: any;
declare var $: any;
declare var jQuery:any;

@Component({
  selector: 'app-edit-client-component',
  templateUrl: './edit-client.component.html'
})
export class EditClientComponent implements OnInit {

  id;
  name;
  phone;
  email;
  status;
  address;
  orderHistory;

  clients;
  client;


  //data: string = 'appendix';

  //model: any = {
  //  data: this.data,
  //}

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
    this.clients = this.db.list('/clients');
    this.client = this.db.object('/clients/'+this.id).subscribe(client => {

      this.name = client.name;
      this.phone = client.phone;
      this.email = client.email;
      this.status = client.status;
      this.address = client.address;
      this.orderHistory = client.orderHistory;
      //console.log(this.data);
      var markupStr = ''+this.orderHistory;
      $('.summernote').summernote('code', markupStr);
    });


    summernote();




  }

  onSubmit() {
    //this.model.data = this.data;
  }

  onEditSubmit(){
    var markupStrIn = $('.summernote').summernote('code');
    let client = {
      name: this.name,
      phone: this.phone,
      email: this.email,
      status: this.status,
      address: this.address,
      orderHistory: markupStrIn,
    }

    //this.model.data = this.data;
    //console.log(this.model.data,44);
    this.clients.update(this.id, client);
    this.router.navigate(['/clients']);
  }

}
