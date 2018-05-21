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
  public playerChange = new Subject<any>();

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

}
