import { Injectable } from '@angular/core';

import Dexie from 'dexie';
import 'dexie-observable';

@Injectable({
  providedIn: 'root'
})
export class PlayerService {

  db: any;
  constructor() {
  	this.makeDatabase();
    this.connectToDatabase();
  }

  makeDatabase(): void {
    this.db = new Dexie('Player');
    this.db.version(1).stores({
      playlist: '++id, yId, name' //only list indexed attrz here...
    });
    
  }

  connectToDatabase(): void {
    
  	this.db.on('changes', function (changes) {
      changes.forEach(function (change) {
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

}
