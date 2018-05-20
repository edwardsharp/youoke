import { Component, OnInit } from '@angular/core';

import Dexie from 'dexie';
import { Playlist } from './playlist';

@Component({
  selector: 'app-playlist',
  template:`

<div>
  <h2>Playlists</h2>
  <table>
    <tr>
      <th>Name</th>
      <th>Items</th>
    </tr>
    <ng-container *ngIf="rows && rows.length>0">
      <tr *ngFor="let playlist of rows">
        <td>{{playlist.name}}</td>
        <td><span *ngFor="let item of playlist.items">{{item.value}} </span></td>
      </tr>
    </ng-container>
    <ng-container *ngIf="!rows || rows.length==0">
      <tr>
        <td colspan="2">No playlists found</td>
      </tr>
    </ng-container>
  </table>
  
  <button mat-button (click)="clearRows()">Clear</button>
  <hr/>

  <mat-card class="playlist-card">
    <mat-card-header>
      <mat-card-title><h2>Create playlist</h2></mat-card-title>
    </mat-card-header>
    <mat-card-content>
      <mat-form-field>
        <input matInput placeholder="Playlist Name" [(ngModel)]="newPlaylist.name"/>
      </mat-form-field>

      <div class="flex" *ngFor="let item of newPlaylist.items">
        <mat-form-field>
          <input matInput placeholder="New Item" [(ngModel)]="item.value">
        </mat-form-field>
        <button mat-icon-button (click)="removeItem(item)" matTooltip="Remove {{item.value}}"><mat-icon>clear</mat-icon></button>
      </div>
    
    </mat-card-content>
    <mat-card-actions>
      <button mat-button (click)="addItem()">Add item</button>
      <button mat-button (click)="addRow(newPlaylist)">Save</button>
    </mat-card-actions>
  </mat-card>

  

</div>
`,
  styles: [':host{min-height: 100vh;} .playlist-card{max-width: 200px;} .flex{display:flex;}']
})
export class PlaylistComponent implements OnInit {

  db: any;
  newPlaylist: Playlist = new Playlist("", [{value: ""}]);
  rows: Playlist[] = [];

  constructor(){}

  ngOnInit(): void {
    console.log('playlist initialized');

    this.makeDatabase();
    this.connectToDatabase();
  }
  makeDatabase(): void {
    this.db = new Dexie('Playlist');
    this.db.version(1).stores({
      playlist: 'name' //only list indexed attrz here...
    });
    this.loadRows();
  }

  connectToDatabase(): void {
    this.db.open().catch((error:any) => {
      alert("Errod during connecting to database : " + error);
    });
  }

  clearRows(): void {
    this.db.playlist.clear().then(result => console.log(result));
    this.loadRows();
  }

  loadRows(): void {
    this.db.playlist.toArray().then(p => this.rows = p);
  }

  addRow(playlist: Playlist): void {
    console.log(playlist);
    this.db.playlist.add({
      name: playlist.name,
      items: playlist.items
    });

    this.loadRows();
    this.newPlaylist = new Playlist("", [{value: ""}]);
  }

  addItem(): void{
    this.newPlaylist.items.push({value: ""});
  }

  removeItem(item:any): void{
    const idx = this.newPlaylist.items.indexOf(item);
    if(idx > -1){
      this.newPlaylist.items.splice(idx, 1);
    }
  }

}
