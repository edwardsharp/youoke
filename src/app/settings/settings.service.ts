import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { Subject } from 'rxjs';

import { Settings } from './settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {


	db: any;
  public needsRefresh = new Subject<boolean>();

  constructor() {
  	this.makeDatabase();
    this.connectToDatabase();
  }

  makeDatabase(): void {
    this.db = new Dexie('Settings');
    this.db.version(1).stores({
      settings: '++id, name, description'
    });
  }

  connectToDatabase(): void {
    this.db.open().then( ok => {
      //init some default stuff...
      this.db.settings.where({name: 'leftNav'}).first().then(setting => {
        if(!setting){
          setting = new Settings("leftNav", "");
          setting["opened"] = false;
          this.db.settings.put(setting);
          this.needsRefresh.next(true);
        }
      });
      this.db.settings.where({name: 'rightNav'}).first().then(setting => {
        if(!setting){
          setting = new Settings("rightNav", "");
          setting["opened"] = false;
          this.db.settings.put(setting);
          this.needsRefresh.next(true);
        }
      });
    }).catch((error:any) => {
      console.error("Errod during connecting to database : " + error);
    });
  }

  clearRows(): Promise<any> {
    return this.db.settings.clear()
    //.then(result => console.log(result));
    // this.loadRows();
  }

  addRow(settings: Settings): Promise<any> {
    console.log(settings);
    return this.db.settings.add({
      name: settings.name,
      description: settings.description
    });
  }

  getSettings(): any{
  	return this.db.settings.toArray();
  }

  getSetting(name: string): Promise<Settings>{
    return this.db.settings.where('name').equals(name);
  }

  updateSettings(settings: Settings): void {
    return this.db.settings.put(settings).then( ok => this.needsRefresh.next(true));
  }

  deleteSetting(id: number) {
    this.needsRefresh.next(true);
    return this.db.settings.where('id').equals(id).delete(); 
  }

  toggleNav(name:string){
    this.db.settings.where('name').equals(name).first( setting => {
      setting["opened"] = !setting["opened"];
      this.db.settings.put(setting);
      //.then( ok => this.needsRefresh.next(true));
    })
  }

}
