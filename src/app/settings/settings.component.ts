import { Component, OnInit } from '@angular/core';

import { SettingsService } from './settings.service';
import { Settings } from './settings';
import { PartylineService } from '../partyline.service';

@Component({
  selector: 'app-settings',
  template:`
<div class="settings-container">
  <h1>Settings</h1>

  <mat-list role="list">
    
    <mat-list-item role="listitem">
      <h3 matLine><mat-icon>vpn_key</mat-icon> YouTube API Key</h3>
      <p matLine>
        
        <mat-form-field>
          <input matInput [(ngModel)]="yt_api_key" (change)="ytApiKeyChange()">
        </mat-form-field>
      </p>
    </mat-list-item>

    <mat-list-item role="listitem">
      <h3 matLine><mat-icon>format_paint</mat-icon> Theme</h3>
      <p matLine>
        Dark <mat-slide-toggle (change)="switchTheme()" [(ngModel)]="isLightTheme">Light</mat-slide-toggle>
      </p>
    </mat-list-item>

    <mat-list-item role="listitem">
      <h3 matLine><mat-icon>live_tv</mat-icon> Channel</h3>
      <p matLine>
        {{channel}} <button mat-icon-button (click)="reloadChannel()" matTooltip="Generate a new channel ID"><mat-icon>refresh</mat-icon></button>
      </p>
    </mat-list-item>
  </mat-list>

  <!--<button mat-button (click)="clearRows()">Clear</button>-->

</div>
`,
  styles: [
  ':host{min-height: 100vh;}',
  '.settings-container{padding: 1.5em}'
  ]
})
export class SettingsComponent implements OnInit {

  db: any;
  newSettings: Settings = new Settings("", "");
  rows: Settings[] = [];
  isLightTheme: boolean;
  channel: string;
  yt_api_key: string;

  constructor(
    private settingsService: SettingsService,
    private partylineService: PartylineService
  ){}

  ngOnInit(): void {
    this.loadRows();
    this.settingsService.getTheme().first( (theme:Settings) => {
       this.isLightTheme = theme.description == 'light-theme' ? true : false;
    });
    this.settingsService.getChannel().first( (channel:Settings) => this.channel = channel.description );
    this.settingsService.getYtApiKey().first( (setting:Settings) => this.yt_api_key = setting.description );
  }
  loadRows(): void {
    this.settingsService.getSettings().then(p => this.rows = p);
  }

  // addRow(settings: Settings): void {
  //   this.settingsService.addRow({
  //     name: settings.name,
  //     description: settings.description
  //   }).then(ok => {
  //     this.loadRows();
  //     this.newSettings = new Settings("", "");
  //   });
  // }

  // clearRows(){
  //   this.settingsService.clearRows();
  // }

  switchTheme(){
    const _theme = this.isLightTheme ? 'light-theme' : 'dark-theme'
    this.settingsService.switchTheme(_theme);
  }

  reloadChannel(){
    this.partylineService.reloadChannel().then( channel => {
      this.channel = channel;
      this.settingsService.setChannel(channel);
    });
  }

  ytApiKeyChange(){
    this.settingsService.setYtApiKey(this.yt_api_key).then( setting => this.yt_api_key = setting.description );
  }

}
