import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
<mat-toolbar><span>YOUOKE</span></mat-toolbar>

<app-channel></app-channel>

  `,
  styles: ['mat-toolbar span{margin: 0 auto;}']
})
export class AppComponent {

  constructor(){}

  ngOnInit(){
  }
}
