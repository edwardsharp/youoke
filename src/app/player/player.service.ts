import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import Dexie from 'dexie';
import 'dexie-observable';

import { Playlist } from '../playlist/playlist';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  db: any;
  playerReady: boolean;
  
  public donePlaying: boolean;

  public player: any;
  public playerChange = new Subject<any>();
  public playerSkip = new Subject<boolean>();

  constructor() {
  	this.makeDatabase();
    this.connectToDatabase();
  }

  makeDatabase(): void {
    this.db = new Dexie('Player');
    this.db.version(1).stores({
      player: '++id, yId, name' //only list indexed attrz here...
    });
    
  }

  connectToDatabase(): void {
    
  	this.db.on('changes', changes => {
      changes.forEach(change => {
        this.playerChange.next(change);
        switch (change.type) {
          case 1: // CREATED
            console.log('An object was created: ' + JSON.stringify(change.obj));
            break;
          case 2: // UPDATED
            console.log('An object with key ' + change.key + ' was updated with modifications: ' + JSON.stringify(change.mods));
            if(change.mods.playing === true){
              this.playYtVideo();
            }else if(change.mods.playing === false){
              this.pauseYtVideo();
            }

            if(change.mods.seekTo){
              this.seekTo(change.mods.seekTo);
            }

            break;
          case 3: // DELETED
            console.log('An object was deleted: ' + JSON.stringify(change.oldObj));
            break;
        }
      });
    });

    this.db.open().catch((error:any) => {
      alert("Errod during connecting to database : " + error);
    });
  }

  clearRows(): any{
    return this.db.player.clear();
  }

  getRows(): Promise<any>{
  	return this.db.player.toArray();
  }

  updatePlayer(player: any): void {
    return this.db.player.put(player);
    //.then( _player => this.needsRefresh.next(true));
  }

  addPlaylist(playlist: Playlist): void{
    console.log('adding player item:',playlist);
    // this.db.player.bulkAdd(playlist.items.map(i => i.value))
    for(let item of playlist.items){
    	this.db.player.add({
	      name: item.value
	    });
    } 
  }

  addPlaylistItem(item: string): Promise<number>{
    console.log('adding player item:',item);
    return this.db.player.add({
      name: item
    });
  }

  deleteItem(id: number) {
    console.log('player service item id:',id);
    // return this.db.delete(id);
    this.playerChange.next(true);
    return this.db.player.where('id').equals(id).delete(); 
  }

  initYtPlayer(): Promise<any>{
    return new Promise((resolve, reject) => {
      var tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window["onYouTubeIframeAPIReady"] = () => {
        console.log("onYouTubeIframeAPIReady!");
        this.playerReady = true;
        resolve();
      }
    });
  }

  loadYtPlayer(): Promise<any>{
    
    return new Promise((resolve, reject) => {
      if(!this.player){
        console.log('gonna loadYtPlayer');
        this.player = new window["YT"].Player('player', {
          // enablejsapi: 1,
          // origin: window.location.origin,
          // host: 'https://www.youtube.com',
          playerVars: {
            modestbranding: 1,
            showinfo: 0,
            controls: 0,
            disablekb: 1,
            rel: 0,
            autoplay: 0
          },
          height: '100%',
          width: '100%',
          events: {
            'onReady': (event) => {
              resolve(this.player);
              console.log('onReady! event:',event);
              // event.target.playVideo();
            },
            'onStateChange': (event) => {
              console.log('onStateChange event:',event);
              // if (event.data == window["YT"].PlayerState.PLAYING && !this.donePlaying) {
              //   setTimeout(() => {
              //     this.player.stopVideo();
              //   }, 6000);
              //   this.donePlaying = true;
              // }
            }
          }
        }); 
        
      }else{
        reject({playerAlreadyLoaded: true});
      }
    });
  }

  cueYtVideo(vID: string){
    console.log('gonna cueYtVideo vID',vID);
    this.player.cueVideoById({videoId:vID, suggestedQuality: "large"});
  }

  loadYtVideo(vID: string){
    console.log('gonna loadVideoById vID',vID);
    this.player.loadVideoById({videoId:vID, suggestedQuality: "large"});
  }

  playYtVideo(){
    console.log('gonna play video!');
    this.player.playVideo();
  }

  pauseYtVideo(){
    console.log('gonna pause vid...');
    this.player.pauseVideo();
  }
  stopYtVideo(){
    this.player.stopVideo();
  }

  skip(){
    this.playerSkip.next(true);
  }

  seekTo(seconds:Number){
    this.player.seekTo(seconds);
  }

}
