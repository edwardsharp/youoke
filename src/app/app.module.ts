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


const appRoutes: Routes = [
  { path: 'playlist', component: PlaylistComponent },
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
  declarations: [
    AppComponent,
    DashboardComponent, 
    PlaylistComponent,
    SettingsComponent
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
