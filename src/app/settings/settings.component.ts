import { Component, OnInit } from '@angular/core';

import { SettingsService } from './settings.service';
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

  constructor(private settingsService: SettingsService){}

  ngOnInit(): void {
    console.log('settings initialized');

  }
  loadRows(): void {
    this.settingsService.getSettings().then(p => this.rows = p);
  }

  addRow(settings: Settings): void {
    console.log(settings);
    this.settingsService.addRow({
      name: settings.name,
      description: settings.description
    }).then(ok => {
      this.loadRows();
      this.newSettings = new Settings("", "");
    });

    
  }
  

}
