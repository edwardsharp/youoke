import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'App',
  template:
  `<div>
    <h1>YOUOKE</h1>
      <p>karatube? youaoke? karayouoketube?? dunno. create a queue of youtube videos, maybe they're karaoke videoz. maybe you got a mic. ...maybe</p>
  </div>`
})
export class AppComponent implements OnInit {
  public readonly name = 'electron-forge';

  ngOnInit(): void {
    console.log('component initialized');
  }
}

@NgModule({
  imports: [BrowserModule],
  declarations: [AppComponent],
  bootstrap: [AppComponent]
})
export class AppModule { }