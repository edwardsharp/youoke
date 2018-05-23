import { Component, OnInit, AfterContentInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';

import { AppToolbarService } from './app-toolbar.service';
import { SettingsService } from './settings/settings.service';
import { Settings } from './settings/settings';
import { PlaylistService } from './playlist/playlist.service';
import { Playlist } from './playlist/playlist';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  @ViewChild('leftNav') leftNav: MatSidenav;
  @ViewChild('rightNav') rightNav: MatSidenav;
  leftNavOpened: boolean;
  rightNavOpened: boolean;

  loading: boolean = true;
  title = 'YOUOKE';
  toolbarHidden: boolean;
  settings: Settings[] = [];
  selectedPlaylistId: number;
  playlists: Playlist[] = [];

  constructor(
    private appToolbarService: AppToolbarService,
    private playlistService: PlaylistService,
    private settingsService: SettingsService
  ) { }

  ngOnInit(){
    
  }

  //[style.display]
  ngAfterContentInit(){
    this.appToolbarService.toolbarHidden
    .subscribe((hidden:boolean) => {
      this.toolbarHidden = hidden;
    });

    this.settingsService.getSettings().then(settings => this.loadSettings(settings) );
    this.settingsService.needsRefresh.subscribe( bool => {
      this.settingsService.getSettings().then(settings => this.loadSettings(settings) );
    });

    this.loadPlaylists();
    this.playlistService.needsRefresh.subscribe(bool => this.loadPlaylists() );
    this.playlistService.playlistSelectionChange.subscribe(id => this.selectedPlaylistId = id );
  }

  loadSettings(settings: any): void{
    this.settings = settings;
    const lNav = settings.find(s => s.name == 'leftNav');
    if(lNav 
      && (lNav.opened === true || lNav.opened == false) 
      && this.leftNavOpened != lNav.opened){
      this.leftNavOpened = lNav.opened;
    }
    const rNav = settings.find(s => s.name == 'rightNav');
    if(rNav 
      && (rNav.opened === true || rNav.opened == false) 
      && this.rightNavOpened != rNav.opened){
      this.rightNavOpened = rNav.opened;
    }
    this.loading = false;
  }

  loadPlaylists(): void {
    this.playlistService.getRows().then(p => this.playlists = p);
  }
  
  playlistSelectionChange(): void{
    // this.selectedPlaylist = this.playlists.find(p => p.id == this.selectedPlaylistId);
    this.playlistService.playlistSelectionChange.next(this.selectedPlaylistId);
  }

  addNewPlaylist(){
    this.playlistService.addNewPlaylist.next(true);
  }

  leftNavToggle(){
    this.leftNav.toggle();
    this.settingsService.toggleNav('leftNav');
  }

  rightNavToggle(){
    this.rightNav.toggle();
    this.settingsService.toggleNav('rightNav');
  }

}
