import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ChannelService {

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

  sendMsg(msg: string){
    this.socket.emit('event', msg);
  }

}
