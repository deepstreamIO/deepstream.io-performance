var deepstream = require( 'deepstream.io-client-js' );
var conf = require( '../conf' ).client;

module.exports = function( clientID, clientType, deepstreamURL ) {

	var latency = [];

	function updateRecord( record, data ) {
		setTimeout( function() {
			data.timestamp = Date.now();
			record.set( data );
		}, conf.messageFrequency );
	}

	var ds = deepstream( deepstreamURL );
	var userName = clientID + '-' + clientType;

	ds.on( 'error', function( e ) {
		console.log( 'error occured', arguments );
	} );

	ds.login( {
		username: userName
	}, function( success, errorEvent, errorMessage ) {
		var record = ds.record.getRecord( 'perf/' + clientID );

		record.subscribe( clientType === 'ping' ? 'pong' : 'ping', function( data ) {
			var lastTimestamp = record.get( 'timestamp' );

			if( record.get( 'ping' ) === conf.messageLimit ) {
				ds.close();
				if( typeof window === 'undefined' ) {
					process.send( {
						clientID: clientID,
						type: clientType,
						latency: latency
					} );
				} else {
					console.log( 'Message limit reached' );
				}
			} else if( clientType === 'ping' && !( record.get( 'ping' ) === 1 && record.get( 'pong' ) === 0 ) ) {
				updateRecord( record, {
					'ping': record.get( 'ping' ) + 1,
					'pong': record.get( 'pong' ),
				} );
				conf.calculateLatency && latency.push( Date.now() - lastTimestamp );
			} else if( clientType === 'pong' ) {
				updateRecord( record, {
					'ping': record.get( 'ping' ),
					'pong': record.get( 'pong' ) + 1,
				} );
			}
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
