var numberOfClient = parseInt( process.argv[ 2 ], 10 );
var deepstreamPort = parseInt( process.argv[ 3 ], 10 );
var currencyPairs = require( './currency-pairs' );
var deepstream = require( 'deepstream.io-client-js' );
var clientCount = 0;
var minLatency = Infinity;
var maxLatency = 0;
var totalUpdatesReceived = 0;
var totalLatency = 0;

if( isNaN( numberOfClient ) || isNaN( deepstreamPort ) ) {
	console.log( 'Invalid args. Please call with <numberOfClient> <deepstreamPort>' );
}

process.setMaxListeners( 0 );
createNextClient();


function createNextClient() {
	clientCount++;
	
	var client = deepstream( 'localhost:' + deepstreamPort );
	client.login( {}, onLogin.bind( this, client ) );

	if( clientCount < numberOfClient ) {
		setTimeout( createNextClient.bind( this, client ), 10 );
	} else {
		console.log( 'created ' + clientCount + ' clients' );
		logStats();
	}
}

function onLogin( client, success, error, errorMsg ) {
	if( !success ) {
		throw errorMsg;
	}

	for( var i = 0; i < currencyPairs.length; i++ ) {
		client.record.getRecord( currencyPairs[ i ] ).subscribe( onUpdate );
	}
}

function onUpdate( data ) {
	var latency = Date.now() - parseInt( data.id, 10 );
	if( latency > maxLatency ) {
		maxLatency = latency;
	}

	if( latency < minLatency ) {
		minLatency = latency;
	}

	totalLatency += latency;
	totalUpdatesReceived++;
}

function logStats() {
	setInterval(function(){
		if( totalUpdatesReceived === 0 ) {
			return;
		}
		console.log( 'Updates', totalUpdatesReceived );
		console.log( 'avg latency', ( totalLatency / totalUpdatesReceived ) );
		console.log( 'max latency', maxLatency );
		console.log( 'min latency', minLatency );
		console.log( '--------------------' );
	}, 3000 );
}