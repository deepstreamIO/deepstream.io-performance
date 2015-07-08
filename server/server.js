var Deepstream = require( 'deepstream.io' );

module.exports = function( onStart ) {
	var deepstream = new Deepstream();
	deepstream.set( 'showLogo', false );
	deepstream.set( 'port', process.env.PORT );
	deepstream.set( 'logLevel', 2 );
	deepstream.on( 'started', function() {
		onStart && onStart( process.env.PORT );
	} );
	deepstream.start();
}
