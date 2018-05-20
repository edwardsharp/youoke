import { Component, OnInit } from '@angular/core';

import { Playlist } from './playlist';
import { PlaylistService } from './playlist.service';
import { PlayerService } from '../player/player.service';

@Component({
  selector: 'app-playlist',
  template:`

<div>

  <div class="flex">
    <mat-form-field>
      <mat-select (selectionChange)="playlistSelectionChange($event)" [(ngModel)]="selectedPlaylistId" placeholder="Playlists">
        <mat-option>None</mat-option>
        <mat-option *ngFor="let playlist of playlists" [value]="playlist.id">{{playlist.name}}</mat-option>
      </mat-select>
    </mat-form-field>
    <button *ngIf="!showNewPlayList" mat-button (click)="addNewPlaylist()">New Playlist</button>
  </div>

  <div *ngIf="selectedPlaylist">
    <button mat-icon-button (click)="removePlaylist()" matTooltip="Delete Playlist {{selectedPlaylist.name}}"><mat-icon>delete_sweep</mat-icon></button>
    <mat-form-field>
      <input matInput placeholder="Playlist Name" [(ngModel)]="selectedPlaylist.name" (keyup.enter)="updatePlaylist(selectedPlaylist)" (change)="selectedPlaylistChange()">
    </mat-form-field>
    <button mat-icon-button (click)="addItem()" matTooltip="Add Item"><mat-icon>playlist_add</mat-icon></button>
    <button mat-icon-button matTooltip="Play All" (click)="playAll()"><mat-icon>playlist_play</mat-icon></button>
    <mat-list>
      <mat-list-item *ngFor="let item of selectedPlaylist.items">
        <button mat-icon-button (click)="removeItem(item)" matTooltip="Remove {{item.value}}"><mat-icon>delete</mat-icon></button>
        <mat-form-field>
          <input matInput placeholder="Item" (keyup.enter)="updatePlaylist(selectedPlaylist)" [(ngModel)]="item.value" (change)="selectedPlaylistChange()">
        </mat-form-field>
        <button mat-icon-button matTooltip="Play {{item.value}}" (click)="playItem(item)"><mat-icon>play_circle_outline</mat-icon></button>
      </mat-list-item>
    </mat-list>
  </div>

  


  <mat-card class="playlist-card" *ngIf="showNewPlayList">
    <mat-card-header style="display:flex;justify-content:space-between;">
      <mat-card-title>
        <h2 *ngIf="newPlaylist.name;else newList">{{newPlaylist.name}}</h2>
        <ng-template #newList><h2>New Playlist</h2></ng-template>
      </mat-card-title>
      <mat-card-subtitle>playlist</mat-card-subtitle>
      <button mat-icon-button (click)="cancelNewPlaylist()"  matTooltip="Cancel"><mat-icon>clear</mat-icon></button>
    </mat-card-header>
    <mat-card-content>
      <mat-form-field>
        <input matInput placeholder="Playlist Name" [(ngModel)]="newPlaylist.name"/>
      </mat-form-field>

      <div class="flex" *ngFor="let item of newPlaylist.items">
        <mat-form-field>
          <input matInput placeholder="New Item" [(ngModel)]="item.value">
        </mat-form-field>
        <button mat-icon-button (click)="removeNewItem(item)" matTooltip="Remove {{item.value}}"><mat-icon>delete</mat-icon></button>
      </div>
    
    </mat-card-content>
    <mat-card-actions>
      <button mat-icon-button (click)="addNewItem()" matTooltip="Add item"><mat-icon>playlist_add</mat-icon></button>
      <button mat-button (click)="addRow(newPlaylist)"><mat-icon>save</mat-icon>Save</button>
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
  selectedPlaylistId: number;

  constructor(
    private playlistService: PlaylistService, 
    private playerService: PlayerService
  ){}

  ngOnInit(): void {
    this.loadRows();

  }
  
  // clearRows(): void {
  //   this.playlistService.clearRows().then(result => console.log(result));
  //   this.loadRows();
  // }

  loadRows(): void {
    this.playlistService.getRows().then(p => this.playlists = p);
  }

  addNewPlaylist(): void{
    this.showNewPlayList = true;
    this.selectedPlaylist = undefined;
    this.selectedPlaylistItems = undefined;
    this.selectedPlaylistId = undefined;
  }

  addRow(playlist: Playlist): void {
    this.playlistService.addRow(playlist).then(id => playlist.id = id);

    this.loadRows();
    this.playlistService.getRows().then(p => {
      this.playlists = p;
      this.selectedPlaylistId = playlist.id;
      //this.playlists.findIndex(p => p.name == playlist.name);
    });

    this.newPlaylist = new Playlist();
    this.showNewPlayList = false;
    console.log('selectedPlist now:',playlist);
    this.selectedPlaylist = playlist;
    
  }

  addItem(): void{
    this.selectedPlaylist.items.push({value: ""});
  }
  addNewItem(): void{
    this.newPlaylist.items.push({value: ""});
  }
  cancelNewPlaylist(): void{
    this.showNewPlayList = false;
    this.newPlaylist = new Playlist();
  }
  updatePlaylist(playlist: Playlist): void{
    this.playlistService.updatePlaylist(playlist);
  }

  removePlaylist(): void{
    this.playlistService.deletePlaylist(this.selectedPlaylist.id).then(p => {
      this.selectedPlaylist = undefined;
      this.selectedPlaylistId = undefined;
      this.loadRows();
    });

  }

  removeItem(item:any): void{
    const idx = this.selectedPlaylist.items.indexOf(item);
    if(idx > -1){
      this.selectedPlaylist.items.splice(idx, 1);
      this.updatePlaylist(this.selectedPlaylist);
    }
  }

  removeNewItem(item:any): void{
    const idx = this.newPlaylist.items.indexOf(item);
    if(idx > -1){
      this.newPlaylist.items.splice(idx, 1);
    }
  }

  playlistSelectionChange(): void{
    this.selectedPlaylist = this.playlists.find(p => p.id == this.selectedPlaylistId);
  }

  selectedPlaylistChange(): void{
    console.log('selected playlist changed!');
    this.updatePlaylist(this.selectedPlaylist);
  }

  playAll(){
    this.playerService.addPlaylist(this.selectedPlaylist);
  }

  playItem(item: any){
    this.playerService.addPlaylistItem(item);
  }

}
