export class Video {
	public id: number;
	public name: string; 
	public value?: string; //#todo: use ytId or file
	public ytId?: string;
	public file?: string;
	public requestedBy?: string;
	public position?: number;

  constructor(name: string) {
  	this.name = name || "";
  }
}
