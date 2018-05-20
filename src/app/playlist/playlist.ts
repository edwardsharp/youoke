export class Playlist {
	public id: number;
	public name: string; 
	public items: Array<{value:string}>;

  constructor(id?:number) {
  	this.name = "";
  	this.items = [{value: ""}];
  	if (id) this.id = id;
  }
}