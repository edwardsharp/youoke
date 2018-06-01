import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import Dexie from 'dexie';
import 'dexie-observable';

import { Video } from '../player/video';

@Injectable({
  providedIn: 'root'
})
export class LibraryService {

	db: any;
	public libraryChange = new Subject<boolean>();
	public libraryVideoUpdate = new Subject<Video>();

  constructor() {
  	this.makeDatabase();
    this.connectToDatabase();
  }

  makeDatabase(): void {
    this.db = new Dexie('Library');
    this.db.version(1).stores({
      library: '++id, yId, file, name' //only list indexed attrz here...
    });
  }

  connectToDatabase(): void {
    this.db.open().catch((error:any) => {
      console.error("Errod during connecting to Library database : " + error);
    });
  }

  clearVideos(): any{
    return this.db.library.clear();
  }

  getVideos(): Promise<any>{
  	return this.db.library.toArray();
  }

  addVideo(video: Video): Promise<number>{
    return this.db.library.add(video).then( id => {
    	this.libraryChange.next(true);
    });
  }

  updateVideo(video: Video): Promise<any>{
  	return this.db.library.put(video).then( ok => {
  		this.libraryVideoUpdate.next(video);
  	});
  }

  deleteVideo(video: Video): Promise<any>{
	  return this.db.library.where('id').equals(video.id).delete().then( ok => {
	  	this.libraryChange.next(true);
	  }); 
  }
}
