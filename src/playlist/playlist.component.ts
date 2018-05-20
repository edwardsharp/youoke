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
        <td>{{playlist.items}}</td>
      </tr>
    </ng-container>
    <ng-container *ngIf="!rows || rows.length==0">
      <tr>
        <td colspan="2">No playlist found</td>
      </tr>
    </ng-container>
  </table>
  
  <button type="button" (click)="clearRows()">Clear</button>
  <hr/>

  <h2>Create playlist</h2>
  <div>
    <label for="name">Name of playlist</label>
    <input type="text" [(ngModel)]="newPlaylist.name"/>
  </div>
  <div>
    <h4>items</h4>
    <div *ngFor="let item of newPlaylist.items; let i = index;">
      <input type="text" [(ngModel)]="newPlaylist.items[i]" />
    </div>
    <button type="button" (click)="addItem()">add item</button>
  </div>
  <button type="button" (click)="addRow(newPlaylist)">Add playlist
  </button>

</div>
`,
  styles: [':host{min-height: 100vh;}']
})
export class PlaylistComponent implements OnInit {

  db: any;
  newPlaylist: Playlist = new Playlist("", []);
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
    this.newPlaylist = new Playlist("", []);
  }

  addItem(): void{
    this.newPlaylist.items.push("New Item");
  }

}
