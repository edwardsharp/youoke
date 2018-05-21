/**
 * nodejs google auth helper lib for authenticating & calling youtube api.
 * 
 * mostly ripped from the nodjs quickstart: 
 *   https://developers.google.com/youtube/v3/quickstart/nodejs 
 *
 * example usage: (see also: gtest.js)
const gAuth = require('./googleauth');
gAuth.init().then( ok => {
  gAuth.myPlaylists().then( data => {
    console.log('myPlaylists response data:',JSON.stringify(data));
    console.log('- - - - - - - - - - - - - - - - - - - - - - - -');
  });
}).catch( err => {
  console.log('caught err:',err);
});
 */ 

const fs = require('fs');
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
let gAuthClient;

// If modifying these scopes, delete your previously saved credentials
const SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
const TOKEN_DIR = `${__dirname}/.credentials/`;
const TOKEN_PATH = TOKEN_DIR + 'youoke.json';

function checkAuthorization(resolve, reject){
  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      reject({needsNewToken: true, err: err});
    } else {
      gAuthClient.credentials = JSON.parse(token);
      resolve();
    }
  });
}

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
  });
}

/**
 * handy\dandy exports for yr consumption <3
 */
module.exports = {
  init(){
    return new Promise((resolve, reject) => {
      fs.readFile('client_secret.json', function processClientSecrets(err, content) {
        if (err){
          reject(err);
        }else{
          // Authorize a client with the loaded credentials, then call the YouTube API.
          const credentials = JSON.parse(content);
          gAuthClient = new OAuth2(
            credentials.installed.client_id, 
            credentials.installed.client_secret, 
            credentials.installed.redirect_uris[0]
          );
          checkAuthorization(resolve, reject);
        }
      });
    });
  },
  authUrl(){
    return gAuthClient.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
  },
  getNewToken(code) {
    return new Promise((resolve, reject) => {
      gAuthClient.getToken(code, function(err, token) {
        if (err) {
          reject(err);
        }else{
          gAuthClient.credentials = token;
          storeToken(token);
          resolve();
        }
      });
    });
  },
  myPlaylists(){
    return new Promise((resolve, reject) => {
      google.youtube('v3').playlists.list( 
        { auth: gAuthClient,
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
        auth: gAuthClient,
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
        auth: gAuthClient,
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
        auth: gAuthClient,
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

