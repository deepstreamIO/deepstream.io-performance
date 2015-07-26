var conf = require( '../conf' ).server;
var Deepstream = require( 'deepstream.io' );
var RedisMessageConnector = require( 'deepstream.io-msg-redis' );
module.exports = function( onStart ) {
	var deepstream = new Deepstream();
	deepstream.set('messageConnector', new RedisMessageConnector( { 
	  port: 6379, 
	  host: 'localhost' 
	}));
	deepstream.set( 'showLogo', false );
	deepstream.set( 'tcpPort', process.env.PORT );
	deepstream.set( 'logLevel', conf.logLevel );
	deepstream.on( 'started', function() {
		onStart && onStart( process.env.PORT );
	} );
	deepstream.start();
	return deepstream;
}
