import { Injectable } from '@angular/core';
import Dexie from 'dexie';

import { Playlist } from './playlist';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

	db: any;
  constructor() {
  	this.makeDatabase();
    this.connectToDatabase();
  }

  makeDatabase(): void {
    this.db = new Dexie('Playlist');
    this.db.version(1).stores({
      playlist: '++id, name' //only list indexed attrz here...
    });

    // this.db.version(2).stores({
    //   playlist: '++id, name, somethingElse' //only list indexed attrz here...
    // });
    
  }

  connectToDatabase(): void {
    this.db.open().catch((error:any) => {
      alert("Errod during connecting to database : " + error);
    });
  }

  getRows(): any{
  	return this.db.playlist.toArray();
  }

  clearRows(): any{
  	return this.db.playlist.clear();
  }

  addRow(playlist: Playlist): Promise<number>{
    console.log('adding playlist:',playlist);
    return this.db.playlist.add({
      name: playlist.name,
      items: playlist.items
    });
  }

  updatePlaylist(playlist: Playlist): Promise<Playlist> {
    return this.db.playlist.put(playlist);
  }

  deletePlaylist(id: number) {
    console.log('playlist service deletePlaylist id:',id);
    // return this.db.delete(id);
    return this.db.playlist.where('id').equals(id).delete(); 
  }
}
