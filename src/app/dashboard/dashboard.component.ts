import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  template:`
<h1>DASHBOARD</h1>
`,
  styles: []
})
export class DashboardComponent implements OnInit {

  constructor(){}

  ngOnInit(): void {
    console.log('component initialized');

  }

}
