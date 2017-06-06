import { Component, OnInit } from '@angular/core';
import { footable } from '../../app.helpers';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import {Router} from '@angular/router';

declare var jQuery:any;
declare var $: any;

@Component({
  selector: 'projects',
  templateUrl: 'projects.template.html'
})
export class ProjectsComponent {

  project;
  name;
  phone;
  company;
  completed;
  task;
  date;
  action;

  projects: FirebaseListObservable<any[]>;

  constructor(public db: AngularFireDatabase, private router:Router) {

    this.projects = db.list('/projects');
  }

  public ngOnInit():any {
    footable();
  }

  onAddSubmit(){
    let project = {
      project: this.project,
      name: this.name,
      phone: this.phone,
      company: this.company,
      completed: this.completed,
      task: this.task,
      date: this.date,
      action: this.action,
    }

    this.projects.push(project);

  }
}
