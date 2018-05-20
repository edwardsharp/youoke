# YOUOKE :microphone:

karatube? youaoke? karayouoketube?? dunno. create a queue of youtube videos, maybe they're karaoke videoz. maybe you got a mic. ...maybe

## electronjs

`npm start`

:zap:

## [Angular CLI](https://github.com/angular/angular-cli) version 6.0.3.

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

note: use `--module=app` e.g. `ng generate @angular/material:material-nav --name=sidenav --module=app`  

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

`ng build -aot --prod`

for electronjs:  
`ng build --base-href ./`  
`ng build --aot -prod --base-href ./`

electronjs release OSX build:  
`./node_modules/.bin/electron-builder . -m`

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

__end-to-end tests__

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
