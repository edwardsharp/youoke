# YOUOKE :microphone:

karatube? youaoke? karayouoketube?? dunno. create a queue of youtube videos, maybe they're karaoke videoz. maybe you got a mic. ...maybe

## Download  
{% if site.github.latest_release %}  
### Latest release {{ site.github.latest_release.tag_name }} ({{ site.github.latest_release.published_at }})  
{% for asset in site.github.latest_release.assets %}
  * [{{ asset.name }}]({{ asset.browser_download_url }})  
{% endfor %}
{% endif %}  
### All Releases  
{% for release in site.github.releases %}
  * {{release.tag_name}} ({{ release.published_at | date_to_string }})  
    {%- for asset in release.assets %}  
    :tv: [{{ asset.name }}]({{ asset.browser_download_url }})
    {%- endfor %}
{% endfor %}

## Dev notes

### Google API

Turn on the YouTube Data API

1. [Use this wizard](https://console.developers.google.com/start/api?id=youtube) to create or select a project in the Google Developers Console and automatically turn on the API. Click __Continue__, then __Go to credentials__.

2. On the __Add credentials to your project page__, click the __Cancel__ button.

3. At the top of the page, select the __OAuth consent screen__ tab. Select an __Email address__, enter a __Product name__ if not already set, and click the __Save__ button.

4. Select the __Credentials__ tab, click the __Create credentials__ button and select __OAuth client ID__.

5. Select the application type __Other__, enter the name "YOUOKE" (or whatever), and click the __Create__ button.

6. Click __OK__ to dismiss the resulting dialog.

7. Click the :arrow_down: (Download JSON) button to the right of the client ID.

8. Move the downloaded file `client_secret_3255645blahblahblah.json` to your working directory and rename it `client_secret.json`.

### electronjs

`npm start`

_-or-_  
`./node_modules/.bin/electron .`
`ng serve`

:zap:

### [Angular CLI](https://github.com/angular/angular-cli) version 6.0.3.

#### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

#### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

note: use `--module=app` e.g. `ng generate @angular/material:material-nav --name=sidenav --module=app`  

#### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

`ng build -aot --prod`

for electronjs:  
`ng build --base-href=""`  
`ng build --aot --prod --base-href=""`

electronjs release OSX build:  
`./node_modules/.bin/electron-builder . -m`

#### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

__end-to-end tests__

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
