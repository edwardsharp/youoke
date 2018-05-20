import { Component, OnInit } from '@angular/core';

import { Playlist } from './playlist';
import { PlaylistService } from './playlist.service';

@Component({
  selector: 'app-playlist',
  template:`

<div>

  <div class="flex">
    <mat-form-field>
      <mat-select (selectionChange)="playlistSelectionChange($event)" [(ngModel)]="selectedPlaylistIdx" placeholder="Playlists">
        <mat-option>None</mat-option>
        <mat-option *ngFor="let playlist of playlists; let i = index;" [value]="i">{{playlist.name}}</mat-option>
      </mat-select>
    </mat-form-field>
    <button mat-button (click)="clearRows()">Clear All Playlists</button>
    <button *ngIf="!showNewPlayList" mat-button (click)="addNewPlaylist()">New Playlist</button>
  </div>

  <div *ngIf="selectedPlaylist">
    <mat-form-field>
      <input matInput placeholder="Playlist Name" [(ngModel)]="selectedPlaylist.name" (keyup.enter)="updatePlaylist(selectedPlaylist)">
    </mat-form-field>
    <button mat-icon-button (click)="removePlaylist()" matTooltip="Remove {{selectedPlaylist.name}}"><mat-icon>delete</mat-icon></button>
    <h4>Items</h4>
    <mat-selection-list #selectedPlaylistItems>
      <mat-list-option *ngFor="let item of selectedPlaylist.items">
        {{item.value}}
      </mat-list-option>
    </mat-selection-list>
  </div>

  


  <mat-card class="playlist-card" *ngIf="showNewPlayList">
    <mat-card-header style="display:flex;justify-content:space-between;">
      <mat-card-title>
        <h2 *ngIf="newPlaylist.name;else newList">{{newPlaylist.name}}</h2>
        <ng-template #newList><h2>New Playlist</h2></ng-template>
      </mat-card-title>
      <mat-card-subtitle>playlist</mat-card-subtitle>
      <button mat-icon-button (click)="showNewPlayList = !showNewPlayList"  matTooltip="Cancel"><mat-icon>clear</mat-icon></button>
    </mat-card-header>
    <mat-card-content>
      <mat-form-field>
        <input matInput placeholder="Playlist Name" [(ngModel)]="newPlaylist.name"/>
      </mat-form-field>

      <div class="flex" *ngFor="let item of newPlaylist.items">
        <mat-form-field>
          <input matInput placeholder="New Item" [(ngModel)]="item.value">
        </mat-form-field>
        <button mat-icon-button (click)="removeItem(item)" matTooltip="Remove {{item.value}}"><mat-icon>delete</mat-icon></button>
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

  
  newPlaylist: Playlist = new Playlist();
  playlists: Playlist[] = [];
  showNewPlayList: boolean;
  selectedPlaylist: any;
  selectedPlaylistItems: any;
  selectedPlaylistIdx: number;

  constructor(private playlistService: PlaylistService){}

  ngOnInit(): void {
    this.loadRows();

  }
  

  clearRows(): void {
    this.playlistService.clearRows().then(result => console.log(result));
    this.loadRows();
  }

  loadRows(): void {
    this.playlistService.getRows().then(p => this.playlists = p);
  }

  addNewPlaylist(): void{
    this.showNewPlayList = true;
    this.selectedPlaylist = undefined;
    this.selectedPlaylistItems = undefined;
    this.selectedPlaylistIdx = undefined;
  }

  addRow(playlist: Playlist): void {
    this.playlistService.addRow(playlist).then(pList => console.log('add ROW:',pList));

    this.loadRows();
    this.playlistService.getRows().then(p => {
      this.playlists = p;
      this.selectedPlaylistIdx = this.playlists.findIndex(p => p.name == playlist.name);
    });

    this.newPlaylist = new Playlist();
    this.showNewPlayList = false;
    console.log('selectedPlist now:',playlist);
    this.selectedPlaylist = playlist;
    
  }

  addItem(): void{
    this.newPlaylist.items.push({value: ""});
  }

  updatePlaylist(playlist: Playlist): void{
    this.playlistService.updatePlaylist(playlist);
  }

  removePlaylist(): void{
    this.playlistService.deletePlaylist(this.selectedPlaylist.id).then(p => {
      this.selectedPlaylist = undefined;
      this.selectedPlaylistIdx = undefined;
      this.loadRows();
    });

  }

  removeItem(item:any): void{
    const idx = this.newPlaylist.items.indexOf(item);
    if(idx > -1){
      this.newPlaylist.items.splice(idx, 1);
    }
  }

  playlistSelectionChange(): void{
    this.selectedPlaylist = this.playlists[this.selectedPlaylistIdx];
  }

}
