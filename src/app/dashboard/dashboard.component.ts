import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';

import { YTSearchService } from '../ytsearch/ytsearch.service';


@Component({
  selector: 'app-dashboard',
  template:`

<mat-tab-group (selectedTabChange)="selectedTabChange($event)">
  
  <mat-tab label="Library">
    <div class="flex-col-center">
      <app-library></app-library>
    </div>
  </mat-tab>

  <mat-tab label="Search YouTube">
    <app-ytsearch></app-ytsearch>
  </mat-tab>

  <mat-tab label="Settings">
    <app-settings></app-settings>
  </mat-tab>


</mat-tab-group>


`,
  styles: [
  '.flex-col-center{display:flex; flex-direction:column; align-items:center;}'
  ]
})
export class DashboardComponent implements OnInit {

  ytInitialized: boolean;

  constructor(
    private ytSearchService: YTSearchService
  ){ }

  ngOnInit(): void {
  }

  ngOnDestroy(): void{
  	// this.playlistService.playlistSelectionChange.next(undefined);
  }

  selectedTabChange(event: MatTabChangeEvent){
    if(event && event.index == 1){
      if(!this.ytInitialized){
        this.ytSearchService.initYtSearch();
        this.ytSearchService.searchReady.subscribe( ready => {
          this.ytInitialized = true;
        });
      }
    }
  }

  

}
