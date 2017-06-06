import { Component, OnDestroy, OnInit, } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'starter',
  templateUrl: 'starter.template.html'
})
export class StarterViewComponent implements OnDestroy, OnInit  {

  items: FirebaseListObservable<any[]>;
public nav:any;

public constructor(db: AngularFireDatabase) {
  this.nav = document.querySelector('nav.navbar');
  this.items = db.list('/users');
}

public ngOnInit():any {
  this.nav.className += " white-bg";
}


public ngOnDestroy():any {
  this.nav.classList.remove("white-bg");
}

}
