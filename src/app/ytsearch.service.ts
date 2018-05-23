import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class YTSearchService {

	public ready: boolean;
	public searchReady = new Subject<any>();


  // The client ID is obtained from the {{ Google Cloud Console }}
  // at {{ https://cloud.google.com/console }}.
  // If you run this code from a server other than http://localhost,
  // you need to register your own client ID.
  // private OAUTH2_CLIENT_ID: string = environment.yt_client_id;
  // private OAUTH2_SCOPES:string[] = [
  //   'https://www.googleapis.com/auth/youtube'
  // ];

  constructor() { 
  	// this.initYtSearch();

  }

  initYtSearch(): Promise<any>{
    return new Promise((resolve, reject) => {
      var tag = document.createElement('script');
      tag.src = "https://apis.google.com/js/client.js?onload=googleApiClientReady";
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      window["googleApiClientReady"] = () => {
        console.log('[ytsearch] googleApiClientReady...');
        window["gapi"].auth.init( () => {
          window.setTimeout(() => {
            console.log('[ytsearch] auth init...');
            window["gapi"].client.setApiKey(environment.yt_api_key);
            window["gapi"].client.load('youtube', 'v3', () => {
              console.log('[ytsearch] READY!');
              
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
    });
  }

 



  search(q: string, nextPageToken?: string;): Promise<any> {
  	//#todo: model window objectz?
	  const request = window["gapi"].client.youtube.search.list({
	    q: q,
      maxResults: 50,
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
    console.log('nextPage',nextPageToken);
    return this.search(q, nextPageToken);
  }

}
