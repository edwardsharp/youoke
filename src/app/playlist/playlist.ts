import { Video } from '../player/video';

export class Playlist {
	public id: number;
	public name: string; 
	public items: Array<Video>;

  constructor(id?:number) {
  	this.name = "";
  	this.items = [new Video("")];
  	if (id) this.id = id;
  }
}