import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { Subject } from 'rxjs';

import { Playlist } from './playlist';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {

	db: any;

  public playlistSelectionChange = new Subject<number>();
  public addNewPlaylist = new Subject<boolean>();
  public needsRefresh = new Subject<boolean>();

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
      console.error("Errod during connecting to Playlist database : " + error);
    });
  }

  getRows(): any{
  	return this.db.playlist.toArray();
  }

  clearRows(): any{
  	return this.db.playlist.clear();
  }

  addRow(playlist: Playlist): Promise<number>{
    this.needsRefresh.next(true);
    return this.db.playlist.add({
      name: playlist.name,
      items: playlist.items
    });
  }

  updatePlaylist(playlist: Playlist): void {
    return this.db.playlist.put(playlist).then( plist => this.needsRefresh.next(true));
  }

  deletePlaylist(id: number) {
    this.needsRefresh.next(true);
    return this.db.playlist.where('id').equals(id).delete(); 
  }

}
