import { Component } from '@angular/core';

import { AppToolbarService } from './app-toolbar.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  toolbarHidden: boolean;

  constructor(private appToolbarService: AppToolbarService) {
  	this.appToolbarService.toolbarHidden
			.subscribe((hidden:boolean) => {
				console.log('appToolbarService hidden:',hidden);
				this.toolbarHidden = hidden;
			});
  }
  

}
