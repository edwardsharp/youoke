import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-video-player',
  template: `
<video 
  src=""
  poster="">
</video>
`, styles: [
  ':host{background-color:black;}',
  'video{width:100%;background-color:black;}'
  ]
})
export class VideoPlayerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
