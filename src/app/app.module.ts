import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes }   from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppMaterialModule } from './app-material.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


const appRoutes: Routes = [
  // { 
  //   path: '',
  //   component: DashboardComponent
  // },
  // {
  //   path: 'playlist',
  //   component: PlaylistComponent
  // },
  { path: '**', 
    redirectTo: '/' 
  }
];


@NgModule({
  declarations: [
    AppComponent
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
