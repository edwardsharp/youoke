# YOUOKE {README} :microphone:

karatube? youaoke? karayouoketube?? dunno. create a queue of youtube videos, maybe they're karaoke videoz. maybe you got a mic. ...maybe

[edwardsharp.github.io/youoke](https://edwardsharp.github.io/youoke/)

## Getting started with development

Interested in contributing to YOUOKE? Have a look at the [Contributing Guidelines](CONTRIBUTING.md) and the current [issues](https://github.com/edwardsharp/youoke/issues)

### Google API

Turn on the YouTube Data API. Generate a YouTube API Key-- you will need to enter this into the settings of the YOUOKE app.

In the future, _hopefully_, there will be more integration with the YouTube API, so an oAuth client secret will need to be setup, like so:

1. [Use this wizard](https://console.developers.google.com/start/api?id=youtube) to create or select a project in the Google Developers Console and automatically turn on the API. Click __Continue__, then __Go to credentials__.  
2. On the __Add credentials to your project page__, click the __Cancel__ button.  
3. At the top of the page, select the __OAuth consent screen__ tab. Select an __Email address__, enter a __Product name__ if not already set, and click the __Save__ button.  
4. Select the __Credentials__ tab, click the __Create credentials__ button and select __OAuth client ID__.  
5. Select the application type __Other__, enter the name "YOUOKE" (or whatever), and click the __Create__ button.  
6. Click __OK__ to dismiss the resulting dialog.  
7. Click the :arrow_down: (Download JSON) button to the right of the client ID.  
8. Move the downloaded file `client_secret_3255645blahblahblah.json` to your working directory and rename it `client_secret.json`.

### Development environment 

Run `ng serve` for a the main YOUOKE project. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

Run `ng serve partyline --port 4201` to start the partyline project that allows people to search & queue song requests.

#### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

note: use `--module=app` e.g. `ng generate @angular/material:material-nav --name=sidenav --module=app`  

#### Build

##### [Angular CLI](https://github.com/angular/angular-cli) 

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

`ng build -aot --prod`

for electronjs:  
`ng build --base-href=""`  
`ng build --aot --prod --base-href=""`

##### electronjs

electronjs release OSX build:  
`./node_modules/.bin/electron-builder . -m`  
_-or-_  
`./node_modules/.bin/electron .`

:zap:

##### socket server

`cd server/`
`npm start`

socket server will be available, by default, on port 8091 

see: [server/README.md](server/README.md)


#### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

__end-to-end tests__

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
