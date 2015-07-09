var conf = require( '../conf' ).server;
var Deepstream = require( 'deepstream.io' );

module.exports = function( onStart ) {
	var deepstream = new Deepstream();
	deepstream.set( 'showLogo', false );
	deepstream.set( 'tcpPort', process.env.PORT );
	deepstream.set( 'logLevel', conf.logLevel );
	deepstream.on( 'started', function() {
		onStart && onStart( process.env.PORT );
	} );
	deepstream.start();
	return deepstream;
}
