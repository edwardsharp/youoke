import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { SettingsService } from '../settings/settings.service';
import { Settings } from '../settings/settings';

@Injectable({
  providedIn: 'root'
})
export class YTSearchService {

	public ready: boolean;
	public searchReady = new Subject<any>();

  private yt_api_key: string;


  // The client ID is obtained from the {{ Google Cloud Console }}
  // at {{ https://cloud.google.com/console }}.
  // If you run this code from a server other than http://localhost,
  // you need to register your own client ID.
  // private OAUTH2_CLIENT_ID: string = environment.yt_client_id;
  // private OAUTH2_SCOPES:string[] = [
  //   'https://www.googleapis.com/auth/youtube'
  // ];
  constructor(private settingsService: SettingsService) { 
  	// this.initYtSearch();
  }

  initYtSearch(): Promise<any>{
    return new Promise((resolve, reject) => {
      this.settingsService.getYtApiKey().first( (setting:Settings) => {
        this.yt_api_key = setting.description;
        if(!this.yt_api_key || this.yt_api_key.length == 0){
          reject();
        }else{
          var tag = document.createElement('script');
          tag.src = "https://apis.google.com/js/client.js?onload=googleApiClientReady";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
          window["googleApiClientReady"] = () => {
            window["gapi"].auth.init( () => {
              window.setTimeout(() => {
                window["gapi"].client.setApiKey(this.yt_api_key);
                window["gapi"].client.load('youtube', 'v3', () => {
                  this.ready = true;
                  this.searchReady.next(true);
                  resolve();
                });

                // window["gapi"].auth.authorize({
                //   client_id: this.OAUTH2_CLIENT_ID,
                //   scope: this.OAUTH2_SCOPES,
                //   immediate: true
                // }, authResult => {
                //   console.log('[ytsearch] authResult:',authResult);
                //   if (authResult && !authResult.error) {
                //     window["gapi"].client.load('youtube', 'v3', () => {
                //       this.ready = true;
                //       this.searchReady.next(true);
                //       resolve();
                //     });
                //   }else{
                //     reject();
                //   } 
                // }, err => {
                //   console.error('[ytsearch] authorize err',err);
                // });
              }, 100);
            });
          }
        }

      }) //settingsService.getYtApiKey().first
      .catch( err => { console.warn('no ytApiKey found!')});
    });
  }

  search(q: string, nextPageToken?: string, maxResults?: number): Promise<any> {
  	//#todo: model window objectz?
	  const request = window["gapi"].client.youtube.search.list({
	    q: q,
      maxResults: maxResults,
      videoEmbeddable: true,
      type: 'video',
	    part: 'snippet',
      pageToken: nextPageToken
	  });

    return new Promise((resolve, reject) => {
      request.execute((response) => {
        resolve(response);
      });
    });
	}

  nextPage(q: string, nextPageToken: string): Promise<any>{
    return this.search(q, nextPageToken, 50);
  }

}
