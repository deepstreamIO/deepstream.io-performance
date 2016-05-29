var conf = require( '../conf' ).client;
var deepStreamUrls = conf.deepStreamUrls;
var completedDeepStreamClientPairs = 0;

process.setMaxListeners( 0 );

for( var i = 0; i < conf.deepStreamClientPairs; i++ ) {
	setTimeout( startDeepstreamClient( i ), conf.spawningSpeed * i );
}

function startDeepstreamClient( clientID ) {
	return function() {
		clientID = clientID + '-' + Date.now();
		console.log( 'Starting client pair:', clientID );
		require( './client' )( clientID, 'odd', getDeepstreamURL(), onDeepstreamClientCompleted );
		require( './client' )( clientID, 'even', getDeepstreamURL(), onDeepstreamClientCompleted );
	}
}

function onDeepstreamClientCompleted( data ) {
		completedDeepStreamClientPairs++;
		if( conf.logLatency ) {
			saveToS3( data );
		}
		if( onDeepstreamClientCompleted === conf.clientAmount ) {
			console.log( 'Test complete' );
			process.exit();
		}
}

function getDeepstreamURL() {
	var deepstreamNode = Math.floor( ( Math.random() * deepStreamUrls.length ) );
	return deepStreamUrls[ deepstreamNode ];
}

function saveToS3( data ) {
	var S3Conf = require( '../conf' ).S3;

	if( !S3Conf.enabled ) {
		return;
	}

	var AWS = require( 'aws-sdk' );
	var s3 = new AWS.S3({
		endpoint: 's3-eu-central-1.amazonaws.com',
		signatureVersion: 'v4',
		region: 'eu-central-1'
	});

	var params = {
		Bucket: S3Conf.bucket,
		Key: S3Conf.dir + '/client/' + data.clientID + '.json',
		Body: JSON.stringify( data.latency )
	};
	s3.putObject(params, function(err, data) {
			if (err) {
				console.log( err );
			} else {
				console.log( 'Successfully uploaded data to ', params.Key );
			}
	 });
}