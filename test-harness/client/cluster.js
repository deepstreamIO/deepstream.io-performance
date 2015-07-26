var cluster = require( 'cluster' );
var numCPUs = require( 'os' ).cpus().length;
var conf = require( '../conf' ).client;

validateConfig();

var clientSpread = getClientSpread();
var completedDeepStreamClientPairs = {};
for(var i=0;i<numCPUs;i++) {
	completedDeepStreamClientPairs[i]=0;
}

var deepStreamPorts = require( '../conf' ).server.deepstreams;
var deepStreamHost = require( '../conf' ).server.host;
var totalClients = 0;

var totalStats = {
	min: 0,
	max: 0
};

if( cluster.isMaster ) {
	console.log( 'Client to core distribution:', clientSpread );
	console.log( 'Running deepstream client cluster with ' + conf.deepStreamClientPairs + ' client pairs on machine with ' + numCPUs + ' cores' );

	for( var i = 0; i < clientSpread.length && clientSpread[ i ] > 0; i++ ) {
		setTimeout( startDeepstreamClientBatchProcess.bind( null, clientSpread[ i ], i ), clientSpread[ i ] * i * conf.spawningSpeed );
	}

	cluster.on( 'exit', onDeepstreamClientExited );
	cluster.on( 'online', onDeepstreamClientStarted );
} else {
	process.setMaxListeners( 0 );
	var processID = Number( process.env.firstClientID );
	var core = Number( process.env.core );
	for( var i = 0; i < process.env.clientAmount; i++ ) {
		setTimeout( startDeepstreamClient( processID + i, core ), conf.spawningSpeed * i );
	}
}

function startDeepstreamClientBatchProcess( clientAmount, core ) {
	cluster.fork( {
		clientAmount: clientAmount,
		firstClientID: totalClients,
		core: core
	} );
	totalClients = totalClients + clientAmount;
}

function startDeepstreamClient( clientID, core ) {
	return function() {
		clientID = clientID + '-' + Date.now();
		console.log( 'Starting client pair:', clientID );
		require( './client' )( clientID, 'odd', getDeepstreamURL(), core );
		require( './client' )( clientID, 'even', getDeepstreamURL(), core );
	}
}

function onDeepstreamClientStarted( worker ) {
	worker.on( 'message', function( args ) {

		completedDeepStreamClientPairs[args.core]++;
		if( clientSpread[args.core] === completedDeepStreamClientPairs[args.core]) {
			worker.kill();
		}

		getLatencyStats( args.latency, totalStats );
		var stats = getLatencyStats( args.latency );
		var latencyLog = [
			'Process ' + args.clientID + ' completed',
			'\tMin Latency: ' + stats.min,
			'\tMax Latency: ' + stats.max,
			'\tAvg Latency: ' + stats.avg,
			'\tLatency: [' + args.latency + ']'
		].join( '\n' );
		conf.logLatency && console.log( latencyLog );
	} );
}

function onDeepstreamClientExited( worker, code, signal ) {
	if( signal ) {
		console.log( "Worker was killed by signal: " + signal );
	} else if( code !== 0 ) {
		console.log( "Worker exited with error code: " + code );
	}
}

function validateConfig() {
	if( !conf.deepStreamClientPairs ) {
		throw 'Please provide amount of client pairs to generate';
	}
}

function getDeepstreamURL() {
	var deepstreamNode = Math.floor( ( Math.random() * deepStreamPorts.length ) );
	return deepStreamHost + ':' + deepStreamPorts[ deepstreamNode ];
}

function getLatencyStats( latency, result ) {
	var l = latency[ 0 ];
	var total = 0;
	result = result || {
		max: l,
		min: l,
		avg: null
	};
	for( var i = 0; i < latency.length; i++ ) {
		l = latency[ i ];
		if( l > result.max ) {
			result.max = l;
		}
		if( l < result.min ) {
			result.min = l;
		}
		total += l;
	}
	result.avg = Math.round( total / latency.length );
	return result;
}

function getClientSpread() {
	var clients = [];
	if( conf.deepStreamClientPairs / numCPUs < 0 ) {
		clients = Array.apply( null, Array( conf.deepStreamClientPairs ) ).map( Number.prototype.valueOf, 1 );
	} else {
		var remainder = conf.deepStreamClientPairs % numCPUs;
		var clientPairsPerCPU = ( conf.deepStreamClientPairs - remainder ) / numCPUs;
		clients = Array.apply( null, Array( numCPUs ) ).map( Number.prototype.valueOf, clientPairsPerCPU );
		for( var i = 0; i < remainder; i++ ) {
			clients[ i ]++;
		}
	}
	return clients;
}
