# YOUOKE [client]

[youoke.party](http://youoke.party)

just a vcr-menu inspired react app, here. :shrug:

note on `https://`: so yeah, a browser can only connect to websocket servers on your local area network if this page is served on `http://` (no `s`). there's an annoying message because browsers (and github pages) prefer https 🤷

note on `KNOWN_ROOMS`: currently this app is configured to look for websocket servers on localhost:9001 (and maybe a few other selected addresses); maybe at some point there will be some kind of discovery system? see: `KNOWN_ROOMS` in Landing.tsx.

## devel 

localhost dev: `npm start`

0.0.0.0 dev: `npm run pubstart`

build: `npm run build`
