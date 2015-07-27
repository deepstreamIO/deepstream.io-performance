var server = new ( require( 'deepstream.io' ) )();
var port = parseInt( process.argv[ 2 ], 10 );
if( isNaN( port ) ) {
	throw new Error( 'no port provided' );
}
server.set( 'tcpHost', 'localhost' );
server.set( 'tcpPort', port );
server.set( 'port', port + 20 );
server.set( 'colors', false );
server.on( 'started', function(){
	console.log( 'started server on ' + port );
});
server.start();