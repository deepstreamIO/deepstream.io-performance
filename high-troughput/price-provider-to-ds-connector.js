var net = require( 'net' );
var server = net.createServer( onConnection ).listen( 6010 );
var ports = parsePorts();
var deepstream = require( 'deepstream.io-client-js' );
var clients = createClients();

function parsePorts() {
	if( typeof process.argv[ 2 ] !== 'string' ) {
		throw new Error( 'ports must be provided as comma separated list' );
	}

	return process.argv[ 2 ].split( ',' ).map(function( port ){ return parseInt( port, 10 ); });
}

function createClients() {
	var i, client, clients = [];

	for( i = 0; i < ports.length; i++ ) {
		client = deepstream( 'localhost:' + ports[ i ] );
		client.login({}, function( port ){ 
			console.log( 'connected to deepstream on port ' + port ); 
		}.bind( this, ports[ i ]));

		clients.push( client );
	}

	return clients;
}

function onConnection( connection ) {
	connection.setEncoding( 'utf8' );
	
	connection.on( 'error', function( err ){
		console.log( err.toString() );
	});

	connection.on( 'data', function( data ) {
		processData( data.toString() );
	});

	console.log( 'got connection' );
}

function processData( data ) {
	var updates = data.split( '|' );
	var i, update;

	for( i = 0; i < updates.length; i++ ) {
		update = updates[ i ].split( ',' );
		
		if( update.length !== 4 ) {
			continue;
		}

		sendUpdate( update );
	}
}

function sendUpdate( update ) {
	for( var i = 0; i < clients.length; i++ ) {
		clients[ i ].record.getRecord( update[ 0 ] ).set({
			id: update[ 3 ],
			bid: update[ 1 ],
			ask: update[ 2 ]
		});
	}
}