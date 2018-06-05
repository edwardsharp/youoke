import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Subject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ChannelService {

	private socket;

  constructor() { 
  	const tag = document.createElement('script');
    tag.src = `${environment.ws_url}/socket.io/socket.io.js`;
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  connect(): Subject<MessageEvent> {

    this.socket = io(environment.ws_url);

    // define an observable which will observe any incoming messages
    // from a socket.io server.
    let observable = new Observable(observer => {
	    this.socket.on('message', (data) => {
	      console.log("received message from WSS",data);
	      observer.next(data);
	    })
	    return () => {
	      this.socket.disconnect();
	    }
    });
    
    // define an Observer which will listen to messages
    // from other components and send messages back to a
    // socket server whenever the `next()` method is called.
    let observer = {
      next: (data: Object) => {
        this.socket.emit('message', JSON.stringify(data));
      }
    };

    // return a Rx.Subject which is a combination
    // of both an observer and observable.
    return Subject.create(observer, observable);
  }

}
