import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes }   from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppMaterialModule } from './app-material.module';
import { AppComponent } from './app.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { PlaylistComponent } from './playlist/playlist.component';
import { SettingsComponent } from './settings/settings.component';
import { PlayerComponent } from './player/player.component';


const appRoutes: Routes = [
  { path: 'playlists', component: PlaylistComponent },
  { path: 'settings', component: SettingsComponent },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  { path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
  	path: 'player',
  	component: PlayerComponent
  }
  // { path: '**', component: PageNotFoundComponent }
];


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent, 
    PlaylistComponent,
    SettingsComponent,
    PlayerComponent
  ],
  imports: [
  	RouterModule.forRoot(
      appRoutes
      // ,{ enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
		AppMaterialModule
  ],
  entryComponents: [PlayerComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
