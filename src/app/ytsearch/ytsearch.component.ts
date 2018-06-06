import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { YTSearchService } from './ytsearch.service';
import { Playlist } from '../playlist/playlist';


@Component({
  selector: 'app-ytsearch',
  template: `
<div *ngIf="!ytInitialized" class="flex-col-center">
  <h2>Loading YouTube Search...</h2>
  <mat-spinner></mat-spinner>
</div>
<div *ngIf="ytInitialized">
<mat-form-field appearance="outline" class="yt-search">
  <mat-label>Search YouTube</mat-label>
  <input matInput [disabled]="!searchReady" [(ngModel)]="q" (keyup.enter)="search()">
  <mat-icon matSuffix *ngIf="!q || q == ''">search</mat-icon>
  <button mat-icon-button matSuffix *ngIf="q && q != ''" (click)="clearSearch()"><mat-icon>clear</mat-icon></button>
</mat-form-field>

<mat-list>
  <mat-list-item *ngFor="let item of searchItems" id="{{item.id.videoId}}">
    <img matListAvatar src="{{item.snippet.thumbnails.default.url}}" alt="thumbnail">
    <h3 matLine matTooltip="{{item.snippet.title}}"> {{item.snippet.title}} </h3>
    <div matLine class="flex">
      <mat-chip-list><mat-chip>{{item.snippet.channelTitle}}</mat-chip></mat-chip-list>
      <span class="flexfill">&nbsp;</span>
      <mat-menu #playlistMenu="matMenu">
        <button mat-menu-item 
          (click)="addItemToNewPlaylist(item)">
          <mat-icon>playlist_add</mat-icon> New Playlist...
        </button>
        <button mat-menu-item *ngFor="let playlist of playlists" 
          (click)="addItemToPlaylist(item, playlist)">
          <mat-icon>playlist_add</mat-icon> {{playlist.name}}
        </button>
      </mat-menu>
      <button mat-icon-button matTooltip="Add To Playlist" 
        *ngIf="showAddToPlaylist"
        [matMenuTriggerFor]="playlistMenu" 
        (click)="openPlaylistMenu(item.id.videoId)">
        <mat-icon>playlist_add</mat-icon>
      </button>
      <button mat-icon-button matTooltip="Add To Queue" (click)="queue(item)">
        <mat-icon class="large-icon">add_to_queue</mat-icon>
      </button>
      <button mat-icon-button matTooltip="Add To Library" 
        *ngIf="showAddToLibrary"
        (click)="addToLibrary(item)">
        <mat-icon>library_add</mat-icon>
      </button>
    </div>
    
  </mat-list-item>
</mat-list>
<button mat-button *ngIf="nextPageToken" (click)="nextPage()" class="show-more-btn">Show More</button>

<div id="showMoreFix" *ngIf="nextPageToken">&nbsp;</div>
</div>
  `,
  styles: [
    '.flex-col-center{display:flex; flex-direction:column; align-items:center;}',
    '.yt-search{margin: 2em 5%; width: 90%;}',
    'mat-list-item:hover{background-color:#efefef; color: black!important}',
    'mat-list-item .flex{display:flex!important; justify-content:flex-end;}',
    'mat-list-item img:hover{border-radius: 0;}',
    '.show-more-btn{width: 100%}',
    '#showMoreFix{min-height:calc(100vh - 120px)}'
  ]
})
export class YTSearchComponent implements OnInit {

  @Input() showAddToPlaylist: boolean;
  @Input() showAddToLibrary: boolean;
  @Input() playlists: Array<Playlist>;
  @Output() addItemToPlaylistEvent = new EventEmitter<{item: any, playlist: Playlist}>();
  @Output() addItemToNewPlaylistEvent = new EventEmitter<any>();
  @Output() queueEvent = new EventEmitter<any>();
  @Output() addToLibraryEvent = new EventEmitter<any>();

  ytInitialized: boolean;
  searchReady: boolean;
  q: string;
  nextPageToken: string;
  searchItems: Array<any> = [];
  

  constructor(
    private ytSearchService: YTSearchService
  ) { }

  ngOnInit() {
    this.ytSearchService.searchReady.subscribe( ready => {
      this.searchReady = ready;
      this.ytInitialized = true;
    });
  }

  search(){
    if(this.q && this.q != ''){
      this.nextPageToken = undefined;
      this.ytSearchService.search(this.q, this.nextPageToken, 15).then( results => {
        // console.log('search results:',results);
        this.nextPageToken = results.nextPageToken;
        this.searchItems = results.items;
      });
    }else{
      this.searchItems = [];
      this.nextPageToken = undefined;
    }
  }

  clearSearch(){
    this.q = undefined;
    this.searchItems = [];
    this.nextPageToken = undefined;
  }

  nextPage(){
    this.ytSearchService.nextPage(this.q, this.nextPageToken).then( results => {
      this.nextPageToken = results.nextPageToken;
      this.searchItems = this.searchItems.concat(results.items);
    });
  }

  //hhhhhhhhack
  openPlaylistMenu(id){
    document.getElementById(id).scrollIntoView(true);
  }

  addItemToPlaylist(item: any, playlist: Playlist){
    this.addItemToPlaylistEvent.next({item: item, playlist: playlist});
  }

  addItemToNewPlaylist(item: any){
    this.addItemToNewPlaylistEvent.next(item);
  }

  queue(item: any){
    this.queueEvent.next(item);
  }

  addToLibrary(item: any){
    this.addToLibraryEvent.next(item);
  }

}
