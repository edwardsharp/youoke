import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { YTSearchService } from '../../../../../src/app/ytsearch/ytsearch.service';
import { ChannelService } from './channel.service';

@Component({
  selector: 'app-channel',
  template: `
<div class="flex-col-center" *ngIf="!connected">
  <mat-form-field appearance="outline" class="channel">
    <mat-label>JOIN IN THE CHANT</mat-label>
    <input matInput [(ngModel)]="channel" (keyup.enter)="joinChannel()" (change)="inputChange()">
    <button mat-icon-button matSuffix *ngIf="!channel || channel == '' || channelError">
      <mat-icon *ngIf="!channelError">sentiment_satisfied</mat-icon>
      <mat-icon *ngIf="channelError">sentiment_very_dissatisfied</mat-icon>
    </button>
    <button mat-icon-button matSuffix *ngIf="!channelError && channel && channel != ''" (click)="joinChannel()"><mat-icon>sentiment_very_satisfied</mat-icon></button>
    <mat-hint *ngIf="!channelError">enter a channel to make requests</mat-hint>
    <mat-hint *ngIf="channelError">o noz! dunno about that channel...</mat-hint>
  </mat-form-field>
</div>

<div *ngIf="connected">
  <app-ytsearch 
    [showAddToPlaylist]="false"
    [showAddToLibrary]="false"
    (queueEvent)="queue($event)"></app-ytsearch>
</div>

  `,
  styles: [
    // 'mat-form-field{width:275px;}',
    '.flex-col-center{height:calc(100vh - 64px); display:flex; flex-direction:column; align-items:center; justify-content:center; flex-direction:column;}'
  ]
})
export class ChannelComponent implements OnInit {

  channel: string;
  channelError: boolean;
  connected: boolean;
  ytInitialized: boolean;

  messages: Subject<any>;

  constructor(
    private ytSearchService: YTSearchService,
    private channelService: ChannelService
  ) { }

  ngOnInit() {
    this.channelService.channelReady.subscribe( (channel:string) => {
      this.channelService.connect()
      .then( _channel => {
        console.log('init channelService.connect channel:',_channel);
        this.channel = _channel;
        if(_channel && _channel.length > 0){
          this.joinChannel();
        }else{
          this.channelError = true;
          this.connected = false;
        }
      });
    });
  }

  inputChange(){
    console.log('input change')
    this.channelError = false;
  }

  joinChannel(){
    console.log('gonna joinChannel', this.channel);
    this.channelService.joinChannel(this.channel).then( ok => {
      console.log('channel.component joinChannel ok:',ok);
      this.channelError = false;
      this.connected = true;
      if(!this.ytInitialized){
        this.ytSearchService.initYtSearch();
        this.ytSearchService.searchReady.subscribe( ready => {
          this.ytInitialized = true;
        });
      }
    }).catch( err => {
      this.channelError = true;
      this.connected = false;
    });
  }

  queue(item:any){
    this.channelService.queue(item);
  }

}
