import { Component, OnInit } from '@angular/core';

import { SettingsService } from './settings.service';
import { Settings } from './settings';

@Component({
  selector: 'app-settings',
  template:`
<div class="settings-container">
  <h1><mat-icon>settings</mat-icon> Settings</h1>

  <mat-list role="list">
    <mat-list-item role="listitem">
      <h3 matLine><mat-icon>format_paint</mat-icon> Theme</h3>
      <p matLine>
        Dark <mat-slide-toggle (change)="switchTheme()" [(ngModel)]="isLightTheme">Light</mat-slide-toggle>
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

  constructor(private settingsService: SettingsService){}

  ngOnInit(): void {
    this.loadRows();
    this.settingsService.getTheme().first( (theme:Settings) => {
       this.isLightTheme = theme.description == 'light-theme' ? true : false;
    });
  }
  loadRows(): void {
    this.settingsService.getSettings().then(p => this.rows = p);
  }

  addRow(settings: Settings): void {
    this.settingsService.addRow({
      name: settings.name,
      description: settings.description
    }).then(ok => {
      this.loadRows();
      this.newSettings = new Settings("", "");
    });
  }

  clearRows(){
    this.settingsService.clearRows();
  }

  switchTheme(){
    const _theme = this.isLightTheme ? 'light-theme' : 'dark-theme'
    this.settingsService.switchTheme(_theme);
  }

}
