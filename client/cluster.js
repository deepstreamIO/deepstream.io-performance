var cluster = require( 'cluster' );
var numCPUs = require( 'os' ).cpus().length;
var conf = require( '../conf' ).client;

var clientID = 0;
var completedDeepStreamClientPairs = 0;
var deepStreamPorts = require( '../conf' ).server.deepstreams;
var deepStreamHost = require( '../conf' ).server.host;
validateConfig();
var totalStats = {
	min: 0,
	max: 0
};

if( cluster.isMaster ) {
	console.log( 'Running deepstream client cluster with ' + conf.deepStreamClientPairs + ' client pairs on machine with ' + numCPUs + ' cores' );

	for( var i = 0; i < conf.deepStreamClientPairs; i++ ) {
		setTimeout( startDeepstreamClient, conf.spawningSpeed * i );
	}

	cluster.on( 'exit', onDeepstreamClientExited );
	cluster.on( 'online', onDeepstreamClientStarted );
} else {
	require( './client' )( ++clientID, process.pid, 'ping', getDeepstreamURL() );
	require( './client' )( ++clientID, process.pid, 'pong', getDeepstreamURL() );
}

function startDeepstreamClient() {
	cluster.fork( {} );
}

function onDeepstreamClientStarted( worker ) {
	worker.on( 'message', function( args ) {
		getLatencyStats( args.latency, totalStats );
		var stats = getLatencyStats( args.latency );
		var latencyLog = [
			'Process ' + args.pid + ' completed',
			'\tMin Latency: ' + stats.min,
			'\tMax Latency: ' + stats.max,
			'\tAvg Latency: ' + stats.avg
		].join( '\n' );
		conf.logClientLatency && console.log( latencyLog );
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
