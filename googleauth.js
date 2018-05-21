/**
 * nodejs google auth helper lib for authenticating & calling youtube api.
 * 
 * mostly ripped from the nodjs quickstart: 
 *   https://developers.google.com/youtube/v3/quickstart/nodejs 
 *
 * example usage: 
const gAuth = require('./googleauth');
gAuth.init().then( ok => {
  gAuth.myPlaylists().then( data => {
    console.log('myPlaylists response data:',JSON.stringify(data));
    console.log('- - - - - - - - - - - - - - - - - - - - - - - -');
  });
  gAuth.myChannel().then( data => {
    console.log('myChannel response data:', JSON.stringify(data));
    console.log('- - - - - - - - - - - - - - - - - - - - - - - -');
  });
  gAuth.channelsListManagedByMe().then( data => {
    console.log('channelsListManagedByMe response data:', JSON.stringify(data));
    console.log('- - - - - - - - - - - - - - - - - - - - - - - -');
  });
  gAuth.getChannel('3dwardsharp').then( data => {
    console.log('getChannel response data:', JSON.stringify(data));
    console.log('- - - - - - - - - - - - - - - - - - - - - - - -');
  });
}).catch( err => {
  console.log('caught err:',err);
});
 */ 

var fs = require('fs');
var readline = require('readline');
var {google} = require('googleapis');
var OAuth2 = google.auth.OAuth2;

// If modifying these scopes, delete your previously saved credentials
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = `${__dirname}/.credentials/`;
var TOKEN_PATH = TOKEN_DIR + 'youoke.json';

let gAuth;

function setAuth(auth){
  gAuth = auth;
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, resolve, reject) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, resolve, reject);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      // callback();
      gAuth = oauth2Client;
      resolve();
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, resolve, reject) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
        reject(err);
      }
      oauth2Client.credentials = token;
      storeToken(token);
      // callback(oauth2Client);
      gAuth = oauth2Client;
      resolve();

    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * handy\dandy exports for your consumption <3
 */
module.exports = {
  init(){
    return new Promise((resolve, reject) => {
      fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err){
          reject(err);
        }else{
          // Authorize a client with the loaded credentials, then call the YouTube API.
          authorize(JSON.parse(content), resolve, reject);
        }
      });
    });
  },
  myPlaylists(){
    return new Promise((resolve, reject) => {
      google.youtube('v3').playlists.list( 
        { auth: gAuth,
          mine: true,
          maxResults: 50,
          part: 'id,snippet,contentDetails'
        }, function(err, response) {
          if (err) {
            reject(err);
          }else{
            resolve(response.data);
          }
      }); 
    });
  },
  myChannel(){
    return new Promise((resolve, reject) => {
      google.youtube('v3').channels.list({
        auth: gAuth,
        mine: true,
        'part': 'id'
      }, function(err, response) {
        if (err) {
          reject(err);
        }else{
          resolve(response.data);
        }
      });
    });
  },
  channelsListManagedByMe(){
    return new Promise((resolve, reject) => {
      google.youtube('v3').channels.list({
        auth: gAuth,
        mine: true,
        maxResults: 50,
        'part': 'snippet,contentDetails'
      }, function(err, response) {
        if (err) {
          reject(err);
        }else{
          resolve(response.data);
        }
      });
    });
  },
  getChannel(username){
    return new Promise((resolve, reject) => {
      if(!username || username == ''){ 
        reject('Error! no username specified.'); 
        return;
      }
      google.youtube('v3').channels.list({
        auth: gAuth,
        part: 'snippet,contentDetails',
        forUsername: username
      }, function(err, response) {
        if (err) {
          reject(err);
        }else{
          resolve(response.data);
        }
      });
    });
  }
}

