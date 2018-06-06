import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Subject } from 'rxjs';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PartylineService {

  channel: string;
  public channelChange = new Subject<string>();

	private socket;

  constructor() { 
  	
  }

  init(): Promise<boolean> {
  	return new Promise( (resolve, reject) => {
  		const tag = document.createElement('script');
	    tag.src = `${environment.ws_url}/socket.io/socket.io.js`;
	    const firstScriptTag = document.getElementsByTagName('script')[0];
	    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  		tag.onload = () => {
  			resolve(true);
  		}
  	})
  }

  connect(): Promise<boolean> {
    return new Promise( (resolve, reject) => {
    	this.socket = io(environment.ws_url);
    	this.socket.on('is_connected', (ok:boolean) => {
	      console.log("is_connected:",ok);
	      if(ok){
	      	resolve(true);
	      }else{
	      	reject(false);
	      }
	    });
    });
  }

  createChannel(): Promise<string>{
    return new Promise( (resolve, reject) => {
      this.socket.on('create_channel', (channel:string) => {
        console.log('channel.service create_channel channel:',channel);
        if(channel && channel.length > 0){
          this.channel = channel;
          this.channelChange.next(channel);
          resolve(channel);
        }else{
          reject(undefined);
        }
      });
      this.socket.emit('create_channel', true);
    });
  }

  joinOrCreateChannel(channel: string): Promise<boolean>{
    return new Promise( (resolve, reject) => {
      this.socket.on('join_or_create_channel', (ok:boolean) => {
        console.log('channel.service join_or_create_channel ok:',ok);
        if(ok){
          this.channel = channel;
          this.channelChange.next(channel);
          resolve(true);
        }else{
          reject(false);
        }
      });
      this.socket.emit('join_or_create_channel', channel);
    });
  }

  reloadChannel(): Promise<string>{
    return this.createChannel();
  }
}
