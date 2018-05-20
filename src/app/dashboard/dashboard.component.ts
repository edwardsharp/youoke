import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  template:`
<h1>DASHBOARD</h1>
<app-playlist></app-playlist>
`,
  styles: []
})
export class DashboardComponent implements OnInit {

  constructor(){}

  ngOnInit(): void {
    console.log('component initialized');

  }

}
