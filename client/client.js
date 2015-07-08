var deepstream = require( 'deepstream.io-client-js' );
var conf = require( '../conf' ).client;

var latency = [];

module.exports = function( pid, clientType, deepstreamURL ) {

	function updateRecord( record, data ) {
		setTimeout( function() {
			record.set( data );
		}, conf.messageFrequency )
	}

	var ds = deepstream( deepstreamURL );
	var userName = 'client-' + pid + '-' + clientType;

	ds.on( 'error', function( e ) {
		console.error( 'error occured', arguments );
	} );

	ds.login( {
		username: userName
	}, function( success, errorEvent, errorMessage ) {
		console.log( 'deepstream ' + userName + ' client connected to ' + deepstreamURL );

		var record = ds.record.getRecord( 'perf/' + pid );

		record.subscribe( clientType === 'ping' ? 'pong' : 'ping', function( data ) {
			var lastTimestamp = record.get( 'timestamp' );

			if( record.get( 'ping' ) === conf.messageLimit ) {
				console.log( 'deepstream ' + userName + ' client completed' );
				ds.close();
				process.exit();
			} else if( clientType === 'ping' && !( record.get( 'ping' ) === 1 && record.get( 'pong' ) === 0 ) ) {
				updateRecord( record, {
					'timestamp': Date.now(),
					'ping': record.get( 'ping' ) + 1,
					'pong': record.get( 'pong' ),
				} );
			} else if( clientType === 'pong' ) {
				updateRecord( record, {
					'timestamp': Date.now(),
					'ping': record.get( 'ping' ),
					'pong': record.get( 'pong' ) + 1,
				} );
			}
			latency.push( Date.now() - lastTimestamp );
		} );

		if( clientType === 'ping' ) {
			record.set( {
				ping: 1,
				pong: 0,
				timestamp: Date.now()
			} );
		}

	} );



}
