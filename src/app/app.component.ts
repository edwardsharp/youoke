import { Component, OnInit, AfterContentInit, ViewChild, HostBinding } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { OverlayContainer} from '@angular/cdk/overlay';

import { AppToolbarService } from './app-toolbar.service';
import { SettingsService } from './settings/settings.service';
import { Settings } from './settings/settings';
import { PlaylistService } from './playlist/playlist.service';
import { Playlist } from './playlist/playlist';

import { PartylineService } from './partyline.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  @HostBinding('class') componentCssClass;

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
  theme: string;
  channel: string;

  constructor(
    private appToolbarService: AppToolbarService,
    private playlistService: PlaylistService,
    private settingsService: SettingsService,
    private overlayContainer: OverlayContainer,
    private partylineService: PartylineService
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
    this.partylineService.init().then( ok => {
      this.partylineService.connect().then( (ok:boolean) => {
        this.partylineService.createChannel().then( (channel:string) => {
          this.channel = channel;
        }).catch(err => {
          console.log('create_channel err!');
        });
      }).catch( err => {
        console.log('connect err!');
      });
    }).catch( err => {
      console.log('partyline init err!');
    });
    
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

    const theme = settings.find(s => s.name == 'theme');
    if(theme){
      this.theme = theme.description;
      this.switchTheme(theme.description, false);
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
    this.leftNavOpened = !this.leftNavOpened;
    this.settingsService.toggleNav('leftNav');
  }

  rightNavToggle(){
    this.rightNav.toggle();
    this.rightNavOpened = !this.rightNavOpened;
    this.settingsService.toggleNav('rightNav');
  }

  switchTheme(theme:string, needsPersist?:boolean){
    console.log('gonna set theme:',theme);
    this.theme = theme;
    this.overlayContainer.getContainerElement().classList.add(theme);
    this.componentCssClass = theme;
    if(needsPersist){
      this.settingsService.switchTheme(theme);
    }
  }

}
