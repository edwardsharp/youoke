import { Component, OnInit } from '@angular/core';
import { ChannelService } from './channel/channel.service';


@Component({
  selector: 'app-root',
  template: `
<mat-toolbar>
	<span class="flexfill"></span>
	<span>YOUOKE</span>
	<span class="flexfill"></span>
	<span>{{channel}}</span>
	<button mat-icon-button 
		*ngIf="channel"
		(click)="leaveChannel()" 
		matTooltip="Leave Channel">
		<mat-icon>clear</mat-icon>
	</button>
</mat-toolbar>

<app-channel></app-channel>

  `,
  styles: ['mat-toolbar{display:flex;}']
})
export class AppComponent {

	private channel: string;

  constructor(private channelService: ChannelService){}

  ngOnInit(){
  	this.channelService.channelChange.subscribe( (channel:string) => {
  		this.channel = channel;
  	});
  }

  leaveChannel(){
  	this.channelService.leaveChannel();
  }
}
