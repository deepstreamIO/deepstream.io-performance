var cluster = require( 'cluster' );
var numCPUs = require( 'os' ).cpus().length;
var conf = require( '../conf' ).client;

validateConfig();
var deepStreamPorts = require( '../conf' ).server.deepstreams;
var deepStreamHost = require( '../conf' ).server.host;

if( cluster.isMaster ) {
	console.log( 'Running deepstream client cluster with ' + conf.deepstreamClientsAmount + ' per node on machine with ' + numCPUs + ' cores' );

	for( var i = 0; i < conf.deepStreamClientPairs; i++ ) {
		setTimeout( startDeepstreamClient, conf.spawningSpeed * i );
	}

	cluster.on( 'exit', onDeepstreamClientExited );

} else {
	require( './client' )( process.pid, 'ping', getDeepstreamURL() );
	require( './client' )( process.pid, 'pong', getDeepstreamURL() );
}

function startDeepstreamClient() {
	cluster.fork( {} );
}

function onDeepstreamClientExited( worker, code, signal ) {
	if( signal ) {
		console.log( "Worker was killed by signal: " + signal );
	} else if( code !== 0 ) {
		console.log( "Worker exited with error code: " + code );
	}
}

function validateConfig() {
	if( !conf.deepstreamClientsAmount ) {
		throw 'Please provide amount of clients to generate';
	}
	if( conf.deepstreamClientsAmount % 2 !== 0 ) {
		throw 'Please provide an even amount of clients';
	}
	conf.deepStreamClientPairs = conf.deepstreamClientsAmount / 2;
}

function getDeepstreamURL() {
	var deepstreamNode = Math.floor( ( Math.random() * deepStreamPorts.length ) );
	return deepStreamHost + ':' + deepStreamPorts[ deepstreamNode ];
}
