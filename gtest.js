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
