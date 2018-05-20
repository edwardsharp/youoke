import { Component, OnInit } from '@angular/core';

import Dexie from 'dexie';
import { Settings } from './settings';

@Component({
  selector: 'app-settings',
  template:`

<div><h2>List of settings</h2>
  <table>
    <tr>
      <th>Name</th>
      <th>Description</th>
    </tr>
    <ng-container *ngIf="rows && rows.length>0">
      <tr *ngFor="let settings of rows">
        <td>{{settings.name}}</td>
        <td>{{settings.description}}</td>
      </tr>
    </ng-container>
    <ng-container *ngIf="!rows || rows.length==0">
      <tr>
        <td colspan="2">No settings found</td>
      </tr>
    </ng-container>
  </table>
  <button mat-button (click)="clearRows()">Clear</button>
  <hr/>
  <h2>Add settings to list</h2>
  <mat-form-field>
    <input matInput placeholder="Name" [(ngModel)]="newSettings.name">
  </mat-form-field>
  <mat-form-field>
    <input matInput placeholder="Description" [(ngModel)]="newSettings.description">
  </mat-form-field>
  <button mat-button (click)="addRow(newSettings)">Add settings
  </button>

</div>
`,
  styles: [':host{min-height: 100vh;}']
})
export class SettingsComponent implements OnInit {

  db: any;
  newSettings: Settings = new Settings("", "");
  rows: Settings[] = [];

  constructor(){}

  ngOnInit(): void {
    console.log('settings initialized');
    // var db = new SettingsDatabase();
    //
    // Manipulate and Query Database
    //
    // this.settings.settings.add({name: "Foobar"}).then(()=>{
    //     return this.settings.settings.where("name").equalsIgnoreCase("foobar").toArray();
    // }).then(fooz => {
    //     alert ("My fooz: " + JSON.stringify(fooz));
    // }).catch(e => {
    //     alert("error: " + e.stack || e);
    // });
    this.makeDatabase();
    this.connectToDatabase();
  }
  makeDatabase(): void {
    this.db = new Dexie('Settings');
    this.db.version(1).stores({
      settings: 'name, description'
    });
    this.loadRows();
  }

  connectToDatabase(): void {
    this.db.open().catch((error:any) => {
      alert("Errod during connecting to database : " + error);
    });
  }

  clearRows(): void {
    this.db.settings.clear().then(result => console.log(result));
    this.loadRows();
  }

  loadRows(): void {
    this.db.settings.toArray().then(p => this.rows = p);
  }

  addRow(settings: Settings): void {
    console.log(settings);
    this.db.settings.add({
      name: settings.name,
      description: settings.description
    });

    this.loadRows();
    this.newSettings = new Settings("", "");
  }

}
