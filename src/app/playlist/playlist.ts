export class Playlist {
	public id: number;
	public name: string; 
	public items: Array<{value:string, name: string}>;

  constructor(id?:number) {
  	this.name = "";
  	this.items = [{value: "", name: ""}];
  	if (id) this.id = id;
  }
}