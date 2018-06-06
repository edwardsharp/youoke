import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Dexie from 'dexie';
import 'dexie-observable';

import { Playlist } from '../playlist/playlist';
import { Video } from './video';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  db: any;
  playerReady: boolean;
  
  public donePlaying: boolean;

  public player: any;
  public playerChange = new Subject<any>();
  public playerNext = new Subject<boolean>();
  public count: number;

  private hasControl: boolean;

  constructor() {
  	this.makeDatabase();
    this.connectToDatabase();
  }

  makeDatabase(): void {
    this.db = new Dexie('Player');
    this.db.version(1).stores({
      player: '++id, position' //only list indexed attrz here...
    });
  }

  connectToDatabase(): void {
    
  	this.db.on('changes', changes => {
      this.db.player.count().then( count => this.count = count );
      this.playerChange.next(true);
      changes.forEach(change => {
        switch (change.type) {
          case 1: // CREATED
            // console.log('An object was created: ' + JSON.stringify(change.obj));
            break;
          case 2: // UPDATED
            // console.log('An object with key ' + change.key + ' was updated with modifications: ' + JSON.stringify(change.mods));
            if(change.mods.playing === true){
              this.playYtVideo();
            }else if(change.mods.playing === false){
              this.pauseYtVideo();
            }

            if(change.mods.seekTo){
              this.seekTo(change.mods.seekTo);
            }

            if(change.mods.volume){
              this.setVolume(change.mods.volume);
            }

            if(change.mods.currentTime && !this.hasControl){
              this.seekTo(change.mods.currentTime);
            }

            break;
          case 3: // DELETED
            // console.log('An object was deleted: ' + JSON.stringify(change.oldObj));
            break;
        }
      });
    });

    this.db.open().catch((error:any) => {
      console.error("Errod during connecting to Player database : " + error);
    });
  }

  clearRows(): any{
    return this.db.player.clear();
  }

  getRows(): Promise<any>{
  	return this.db.player.orderBy('position').toArray();
  }

  updatePlayer(player: any) {
    this.playerChange.next(player);
    return this.db.player.put(player);
  }

  addPlaylist(playlist: Playlist): void{
    let i = this.count || 0;
    for(let item of playlist.items){
      item.position = i;
      delete item.id;
      i += 1;
      console.log('[player.service] gonna add playlist item:',item);
      this.db.player.add(item);
    } 
  }

  addPlaylistItem(video: Video): Promise<number>{
    video.position = this.count || 0;
    delete video.id;
    return this.db.player.add(video);
  }

  deleteItem(id: number) {
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
        this.playerReady = true;
        resolve();
      }
    });
  }

  loadYtPlayer(controls: boolean): Promise<any>{
    this.hasControl = controls;
    return new Promise((resolve, reject) => {
      if(!this.player){
        this.player = new window["YT"].Player('player', {
          // origin: window.location.origin,
          // host: 'https://www.youtube.com',
          playerVars: {
            enablejsapi: 1,
            modestbranding: 1,
            showinfo: 0,
            controls: controls ? 1 : 0,
            disablekb: controls ? 1 : 0,
            autoplay: 0,
            rel: 0,
            iv_load_policy: 0
          },
          height: '100%',
          width: '100%',
          events: {
            'onReady': (event) => {
              if(!controls){
                this.setVolume(0);
              }
              resolve(this.player);              
            },
            'onStateChange': (event) => {
              // console.log('onStateChange event:',event);
              if(event.data == window["YT"].PlayerState.ENDED){
                this.next();
              }
            },
            'onError': (error) => {
              console.error('yt player onError:',error);
            }
          }
        }); 
        
      }else{
        reject({playerAlreadyLoaded: true});
      }
    });
  }

  cueYtVideo(vID: string){
    this.player.cueVideoById({videoId:vID, suggestedQuality: "large"});
  }

  loadYtVideo(vID: string){
    if(vID){
      this.player.loadVideoById({videoId:vID, suggestedQuality: "large"});
    }else{
      this.pauseYtVideo();
    }
  }

  playYtVideo(){
    this.player.playVideo();
  }

  pauseYtVideo(){
    this.player.pauseVideo();
  }
  stopYtVideo(){
    this.player.stopVideo();
  }

  next(){
    this.playerNext.next(true);
  }

  seekTo(seconds:Number){
    this.player.seekTo(seconds, true);
  }

  setVolume(level: Number){
    if(!this.hasControl){
      this.player.unMute();
      this.player.setVolume(level);
    }
  }

  getVolume(){
    return this.player.getVolume();
  }

  queueItem(item: any): Promise<Video>{
    return new Promise( (resolve, reject) => {
      let _video = new Video(item.snippet.title);
      _video.value = item.id.videoId;
      this.addPlaylistItem(_video).then(ok => {
        resolve(_video);
      }).catch(err => {
        reject(err);
      });
    })
  }

}
