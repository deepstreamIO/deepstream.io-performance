var deepstream = require( 'deepstream.io-client-js' );
var conf = require( '../conf' ).client;

module.exports = function( clientID, clientType, deepstreamURL, core ) {

	var isOdd = clientType === 'odd';
	var isEven = clientType === 'even';
	var latency = [];

	function updateRecord( record, data ) {
		setTimeout( function() {
			data.timestamp = Date.now();
			record.set( data );
		}, conf.messageFrequency );
	}

	function closeClient() {
		ds.close();

		if( typeof window === 'undefined' && latency.length > 0 ) {
			process.send( {
				clientID: clientID,
				type: clientType,
				latency: latency, 
				core: core
			} );
		} else {
			console.log( 'Message limit reached by ', clientID );
		}
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

		record.subscribe( 'count', function( data ) {
			var lastTimestamp = record.get( 'timestamp' );
			var count = record.get( 'count' );
			var newCount = count+1;

			var incrementOdd = isOdd && count % 2 > 0;
			var incementEven = isEven && count % 2 === 0;

			if( incementEven || incrementOdd ) {
				updateRecord( record, {
					'count': newCount
				} );
			} 

			if( incementEven && conf.calculateLatency ) {
				latency.push( Date.now() - lastTimestamp );
			}

			if( newCount === conf.messageLimit  ) {
				closeClient();
			}
		} );

		if( clientType === 'even' ) {
			record.set( {
				count: 0,
				timestamp: Date.now()
			} );
		}
	} );
}
