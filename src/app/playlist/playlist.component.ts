import { Component, OnInit } from '@angular/core';

import { Playlist } from './playlist';
import { PlaylistService } from './playlist.service';
import { PlayerService } from '../player/player.service';
import { Video } from '../player/video';

@Component({
  selector: 'app-playlist',
  template:`

<div>
  <div *ngIf="selectedPlaylist" class="selected-playlist">
    <mat-form-field>
      <input matInput placeholder="Playlist Name" [(ngModel)]="selectedPlaylist.name" (keyup.enter)="updatePlaylist(selectedPlaylist)" (change)="selectedPlaylistChange()">
    </mat-form-field>
    
    <div>
      <div *ngFor="let item of selectedPlaylist.items">
        <button mat-icon-button (click)="removeItem(item)" matTooltip="Remove Video"><mat-icon>clear</mat-icon></button>
        <mat-form-field class="yt-input">
          <mat-label>YouTube Video ID</mat-label>
          <input matInput placeholder="8leAAwMIigI" (keyup.enter)="updatePlaylist(selectedPlaylist)" [(ngModel)]="item.value" (change)="selectedPlaylistChange()">
          <mat-hint matTooltip="{{item.name}}">{{item.name}}</mat-hint>
        </mat-form-field>
        <button mat-icon-button 
        matTooltip="Queue" 
        (click)="playItem(item)">
          <mat-icon>add_to_queue</mat-icon>
        </button>
      </div>
    </div>

    <div class="btn-nav">
      <button mat-icon-button (click)="removePlaylist()" matTooltip="Delete Playlist {{selectedPlaylist.name}}"><mat-icon>delete_sweep</mat-icon></button>
      <button mat-button (click)="addItem()" matTooltip="Add Video"><mat-icon>add</mat-icon></button>
      <button mat-icon-button matTooltip="Queue All" (click)="playAll()"><mat-icon>playlist_play</mat-icon></button>
    </div>
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
      <mat-form-field class="yt-name-input">
        <input matInput placeholder="Playlist Name" [(ngModel)]="newPlaylist.name"/>
      </mat-form-field>

      <div class="flex" *ngFor="let item of newPlaylist.items">
        <button mat-icon-button (click)="removeNewItem(item)" matTooltip="Remove {{item.value}}"><mat-icon>clear</mat-icon></button>      
        <mat-form-field class="yt-input">
          <mat-label>YouTube Video ID</mat-label>
          <input matInput placeholder="8leAAwMIigI" [(ngModel)]="item.value">
        </mat-form-field>
      </div>
    
    </mat-card-content>
    <mat-card-actions>
      <button mat-icon-button (click)="addNewItem()" matTooltip="Add Video"><mat-icon>add</mat-icon></button>
      <button mat-button (click)="addRow(newPlaylist)"><mat-icon>save</mat-icon>Save</button>
    </mat-card-actions>
  </mat-card>

</div>
`,
  styles: [':host{display:flex; justify-content:center;}',
  '.playlist-card{max-width: 200px; box-shadow: none!important;}',
  '.yt-name-input{width:140px!important}',
  '.yt-input{width: 100px!important}',
  '.selected-playlist{margin-top: 1em}',
  'mat-card-actions{margin:0!important}',
  '.btn-nav{position:sticky; z-index:2; bottom:0; background-color:white; display:flex; justify-content:space-around;}',
  'mat-hint{overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}'
  ]
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
    this.playlistService.playlistSelectionChange.subscribe(id => this.playlistSelectionChange(id));
    this.playlistService.addNewPlaylist.subscribe(bool => this.addNewPlaylist());
    this.playlistService.needsRefresh.subscribe(bool => {
      this.playlistService.getRows().then( (playlists) => {
        this.playlists = playlists;
        if(this.selectedPlaylist && this.selectedPlaylist.id){
          this.selectedPlaylist = this.playlists.find( p => p.id == this.selectedPlaylist.id);
        }
      });
    })
  }

  ngOnDestroy(): void{
    // this.playlistService.playlistSelectionChange.next(undefined);
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
    this.playlistService.playlistSelectionChange.next(undefined);
  }

  addRow(playlist: Playlist): void {
    this.playlistService.addRow(playlist).then(id => playlist.id = id);

    this.loadRows();
    this.playlistService.getRows().then(p => {
      this.playlists = p;
      this.selectedPlaylistId = playlist.id;
      this.playlistService.needsRefresh.next(true);
      this.playlistService.playlistSelectionChange.next(playlist.id);
      //this.playlists.findIndex(p => p.name == playlist.name);
    });

    this.newPlaylist = new Playlist();
    this.showNewPlayList = false;
    console.log('selectedPlist now:',playlist);
    this.selectedPlaylist = playlist;
    
  }

  addItem(): void{
    this.selectedPlaylist.items.push(new Video(""));
  }
  addNewItem(): void{
    this.newPlaylist.items.push(new Video(""));
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
      this.playlistService.playlistSelectionChange.next(undefined);
      this.playlistService.needsRefresh.next(true);
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

  playlistSelectionChange(id: number): void{
    this.selectedPlaylist = this.playlists.find(p => p.id == id);
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
