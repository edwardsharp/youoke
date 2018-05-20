import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { SettingsComponent } from './settings/settings.component';

@Component({
  selector: 'app',
  template:`
<div>
  <nav>
    <a routerLink="/" routerLinkActive="active">Home</a> | 
    <a routerLink="/settings" routerLinkActive="active">Settings</a>
  </nav>

  <router-outlet></router-outlet>
</div>
`,
  styles: []
})
export class AppComponent implements OnInit {
  public readonly name = 'youoke';

  constructor(){}

  ngOnInit(): void {
    console.log('component initialized');
  }
}

const appRoutes: Routes = [
  { path: 'settings', component: SettingsComponent },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  { path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  }
  // { path: '**', component: PageNotFoundComponent }
];


@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes)
  ],
  declarations: [
    AppComponent, 
    DashboardComponent, 
    SettingsComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
