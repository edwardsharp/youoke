const gAuth = require('./googleauth');
	
gAuth.init();

setTimeout( () => {
	gAuth.getChannel();
},1000);
