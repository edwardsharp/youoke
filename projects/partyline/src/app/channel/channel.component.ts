import { Component, OnInit } from '@angular/core';

import { YTSearchService } from '../../../../../src/app/ytsearch/ytsearch.service';



//
    // 

@Component({
  selector: 'app-channel',
  template: `
<div class="flex-col-center" *ngIf="!connected">
  <mat-form-field appearance="outline" class="channel">
    <mat-label>Join Channel</mat-label>
    <input matInput [(ngModel)]="channel" (keyup.enter)="joinChannel()">
    <button mat-icon-button matSuffix *ngIf="!channel || channel == ''"><mat-icon>sentiment_satisfied</mat-icon></button>
    <button mat-icon-button matSuffix *ngIf="channel && channel != ''" (click)="joinChannel()"><mat-icon>sentiment_very_satisfied</mat-icon></button>
    <mat-hint>Enter a channel ID to join the party!</mat-hint>
  </mat-form-field>
</div>

<div *ngIf="connected">
  <app-ytsearch></app-ytsearch>
</div>

  `,
  styles: [
    '.flex-col-center{height:calc(100vh - 64px); display:flex; flex-direction:column; align-items:center; justify-content:center; flex-direction:column;}'
  ]
})
export class ChannelComponent implements OnInit {

  channel: string;
  connected: boolean;
  ytInitialized: boolean;

  constructor(private ytSearchService: YTSearchService) { }

  ngOnInit() {
  }

  joinChannel(){
    this.connected = true;
    if(!this.ytInitialized){
      this.ytSearchService.initYtSearch();
      this.ytSearchService.searchReady.subscribe( ready => {
        this.ytInitialized = true;
      });
    }
  }
}
