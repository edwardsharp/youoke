import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
// import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import Dexie from 'dexie';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChannelService {

  public channel: string;
  public channelReady = new Subject<string>();
  public channelChange = new Subject<string>();
	private socket;
  private db: any;

  constructor() { 
  	const tag = document.createElement('script');
    tag.src = `${environment.ws_url}/socket.io/socket.io.js`;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    this.makeDatabase();
    this.connectToDatabase();
  }

  makeDatabase(): void {
    this.db = new Dexie('Channel');
    this.db.version(1).stores({
      channel: '++id, name' //only list indexed attrz here...
    });

  }

  connectToDatabase(): void {
    this.db.open()
    .then( ok => {
      this.db.channel.where({name: 'channel'}).first().then(channel => {
        if(!channel){
          this.db.channel.put({name: "channel"});
        }else{
          console.log('[channel.service] gonna set this.channel:',channel.description);
          this.channel = channel.description;
          this.channelReady.next(this.channel);
          this.channelChange.next(this.channel);
        }
      });
    })
    .catch((error:any) => {
      console.error("Errod during connecting to Channel database : " + error);
    });
  }

  // clearRows(): any{
  //   return this.db.channel.clear();
  // }
  // getChannel(){
  //   this.db.channel.where('name').equals('channel').first( channel => {
  //     this.channel = channel.description;
  //   });
  // }
  setChannel(channel:string){
    this.channel = channel;
    this.db.channel.where('name').equals('channel').first( _channel => {
      _channel.description = channel;
      this.db.channel.put(_channel);
      this.channelChange.next(this.channel);
    });
  }

  connect(): Promise<string> {
    return new Promise( (resolve, reject) => {
      if(this.socket){
        console.log('[channel.service] connect() socket already exists!');
        resolve(this.channel);
      }else{
        this.socket = io(environment.ws_url);
        this.socket.on('is_connected', (data) => {
          console.log("received is_connected from WSS",data);
          
          resolve(this.channel);
        });
      }
    });
  }

  joinChannel(channel: string): Promise<boolean>{
    return new Promise( (resolve, reject) => {
      this.socket.on('join_channel', (ok:boolean) => {
        console.log('channel.service join_channel ok:',ok);
        if(ok){
          this.setChannel(channel);
          resolve(true);
        }else{
          this.setChannel(undefined);
          reject(false);
        }
      });
      this.socket.emit('join_channel', channel);
    });
  }

  leaveChannel() {
    this.setChannel(undefined);
    this.channelReady.next(this.channel);
    this.channelChange.next(this.channel);
  }

  queue(item:any){
    this.socket.emit('queue', item);
  }

}
