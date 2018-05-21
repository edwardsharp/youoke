const readline = require('readline');
const gAuth = require('./googleauth');

function getDataStuffz(){
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
}

gAuth.init().then( ok => {
	getDataStuffz();
}).catch( err => {
	if(err.needsNewToken){
		console.log('Authorize this app by visiting this url: ', gAuth.authUrl());
		var rl = readline.createInterface({
		  input: process.stdin,
		  output: process.stdout
		});
		rl.question('Enter the code from that page here: ', function(code) {
		  rl.close();
		  gAuth.getNewToken(code).then( ok => {
		  	getDataStuffz();
		  }).catch( err => {
		  	console.log('getNewToken err:',err);
		  });
		});
	}else{
		console.log('caught err:',err);
	}
	
});
