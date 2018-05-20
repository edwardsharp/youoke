import { Component, OnInit, OnDestroy } from '@angular/core';
import { AppToolbarService } from '../app-toolbar.service';



@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.css']
})
export class PlayerComponent implements OnInit {

  constructor(private appToolbarService: AppToolbarService) { }

  ngOnInit() {
  	window.setTimeout(() => {this.appToolbarService.toggleHidden(true); }, 10);
  }
  ngOnDestroy(){
  	this.appToolbarService.toggleHidden(false);
  }
}
