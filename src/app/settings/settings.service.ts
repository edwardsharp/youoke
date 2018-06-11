import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import 'dexie-observable';
import { Subject } from 'rxjs';

import { Settings } from './settings';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

	db: any;
  public needsRefresh = new Subject<boolean>();
  public needsChannelRefresh = new Subject<boolean>();
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

    this.db.on('changes', changes => {
      changes.forEach(change => {
        console.warn('settings change:',change);
        if(change.obj && change.obj.name == "channel"){
          this.needsChannelRefresh.next(true);
        }else{
          this.needsRefresh.next(true);
        }
      });
    });

    this.db.open().then( ok => {
      //init some default stuff...
      this.db.settings.where({name: 'yt_api_key'}).first().then(setting => {
        if(!setting){
          setting = new Settings("yt_api_key", undefined);
          this.db.settings.put(setting);
          this.needsRefresh.next(true);
        }
      });
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
      this.db.settings.where({name: 'theme'}).first().then(setting => {
        if(!setting){
          setting = new Settings("theme", "dark-theme");
          this.db.settings.put(setting);
          this.needsRefresh.next(true);
        }
      });

      this.db.settings.where({name: 'channel'}).first().then(setting => {
        if(!setting){
          setting = new Settings("channel", undefined);
          this.db.settings.put(setting);
          this.needsRefresh.next(true);
        }
      });
    }).catch((error:any) => {
      console.error("Errod during connecting to database : " + error);
    });
  }

  clearRows(): Promise<any> {
    return this.db.settings.clear();
  }

  addRow(settings: Settings): Promise<any> {
    // console.log(settings);
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
    });
  }

  getTheme(){
    return this.db.settings.where('name').equals('theme');
  }
  switchTheme(theme: string){
    this.db.settings.where('name').equals('theme').first( (setting:Settings) => {
      setting.description = theme;
      this.db.settings.put(setting).then( ok => this.needsRefresh.next(true));
    });
  }

  getChannel(){
    return this.db.settings.where('name').equals('channel');
  }
  setChannel(channel:string){
    this.db.settings.where('name').equals('channel').first( (setting:Settings) => {
      setting.description = channel;
      this.db.settings.put(setting).then( ok => this.needsRefresh.next(true) );
    })
  }

  getYtApiKey(){
    return this.db.settings.where('name').equals('yt_api_key');
  }
  setYtApiKey(yt_api_key:string): Promise<Settings>{
    return new Promise( (resolve, reject) => {
      this.db.settings.where('name').equals('yt_api_key').first( (setting:Settings) => {
        setting.description = yt_api_key;
        this.db.settings.put(setting).then( ok => resolve(setting) );
      });
    })
    
  }

}
