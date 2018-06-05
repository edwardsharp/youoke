import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
// import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  channel: string;
	private socket;

  constructor() { 
  	const tag = document.createElement('script');
    tag.src = `${environment.ws_url}/socket.io/socket.io.js`;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  connect(): void {
    this.socket = io(environment.ws_url);
    this.socket.on('message', (data) => {
      console.log("received message from WSS",data);
    });
  }

  joinChannel(channel: string): Promise<boolean>{
    return new Promise( (resolve, reject) => {
      this.socket.on('join_channel', (ok:boolean) => {
        console.log('channel.service join_channel ok:',ok);
        if(ok){
          this.channel = channel;
          resolve(true);
        }else{
          reject(false);
        }
      });
      this.socket.emit('join_channel', channel);
    });
  }

}
