var cluster = require( 'cluster' );
var numCPUs = require( 'os' ).cpus().length;
var conf = require( '../conf' ).client;

validateConfig();
var completedDeepStreamClientPairs = 0;
var deepStreamPorts = require( '../conf' ).server.deepstreams;
var deepStreamHost = require( '../conf' ).server.host;

var totalStats = {
	min: 0,
	max: 0
};

if( cluster.isMaster ) {
	var clientSpread = getClientSpread();
	console.log( 'Running deepstream client cluster with ' + conf.deepStreamClientPairs + ' client pairs on machine with ' + numCPUs + ' cores' );

	for( var i = 0; i < clientSpread.length && clientSpread[ i ] > 0; i++ ) {
		setTimeout( startDeepstreamClientBatchProcess.bind( null, clientSpread[ i ], i ), clientSpread[ i ] * i * conf.spawningSpeed );
	}

	cluster.on( 'exit', onDeepstreamClientExited );
	cluster.on( 'online', onDeepstreamClientStarted );
} else {
	process.setMaxListeners( 0 );
	var processID = Number( process.env.firstClientID );
	for( var i = 0; i < process.env.clientAmount; i++ ) {
		setTimeout( startDeepstreamClient( processID + i ), conf.spawningSpeed * i );
	}
}

function startDeepstreamClientBatchProcess( clientAmount, processNumber ) {
	cluster.fork( {
		clientAmount: clientAmount,
		firstClientID: processNumber * clientAmount
	} );
}

function startDeepstreamClient( clientID ) {
	return function() {
		clientID = clientID + '-' + Date.now();
		console.log( 'Starting client:', clientID );
		require( './client' )( clientID, 'ping', getDeepstreamURL() );
		require( './client' )( clientID, 'pong', getDeepstreamURL() );
	}
}

function onDeepstreamClientStarted( worker ) {
	console.log( 'Started client with pid: ' + worker.process.pid );
	worker.on( 'message', function( args ) {
		getLatencyStats( args.latency, totalStats );
		var stats = getLatencyStats( args.latency );
		var latencyLog = [
			'Process ' + args.clientID + ' completed',
			'\tMin Latency: ' + stats.min,
			'\tMax Latency: ' + stats.max,
			'\tAvg Latency: ' + stats.avg,
			'\tLatency: ' + args.latency
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
	completedDeepStreamClientPairs++;
	if( completedDeepStreamClientPairs === conf.deepStreamClientPairs ) {

		console.log( 'Total Stats' );
		console.log( '\tMin Latency: ' + totalStats.min );
		console.log( '\tMax Latency: ' + totalStats.max );
		console.log( '\n' );

		console.log( 'Client Performance Tests Finished' );
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
	console.log( clients )
	return clients;
}
