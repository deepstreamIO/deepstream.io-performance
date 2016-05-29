var spawn = require('child_process').spawn;
var conf = require( '../conf' ).server;
var fs = require('fs');
var zlib = require('zlib');

var Deepstream = require( 'deepstream.io' );
var RedisMessageConnector = require( 'deepstream.io-msg-redis' );
var performanceUsage;

var deepstream = new Deepstream();
deepstream.set('messageConnector', new RedisMessageConnector( {
		port: process.env.REDIS_PORT || 6379,
		host: process.env.REDIS_HOST || 'localhost'
	}));
deepstream.set( 'showLogo', false );
deepstream.set( 'tcpPort', conf.tcpPort );
deepstream.set( 'port', conf.port );
deepstream.set( 'logLevel', conf.logLevel );
deepstream.on( 'started', onDeepstreamStarted );
deepstream.on( 'stopped', onDeepstreamStopped );

if( conf.totalTestTime !== -1 ) {
	setTimeout( function() {
		deepstream.stop();
	}, conf.totalTestTime );
}

deepstream.start();

function onDeepstreamStarted() {
	console.log( 'deepstream with PID:' + process.pid + ' listening on port ' + conf.port );
	performanceUsage = spawn( 'bash' );
	performanceUsage.stdin.write( 'rm -rf stats && mkdir stats\n' );
	performanceUsage.stdin.write( 'top -p ' + process.pid + ' -b -d 1 > stats/' + process.pid + '.txt &\n' );
}

function onDeepstreamStopped() {
	console.log( 'Server Performance Tests Finished' );
	performanceUsage.stdin.end();
	saveToS3();
}

function saveToS3() {
	var S3Conf = require( '../conf' ).S3;

	if( !S3Conf.enabled ) {
		return;
	}

	var AWS = require( 'aws-sdk' );
	var body = fs.createReadStream( 'stats/' + process.pid + '.txt' ).pipe( zlib.createGzip() );
	var s3 = new AWS.S3({
		endpoint: 's3-eu-central-1.amazonaws.com',
		signatureVersion: 'v4',
		region: 'eu-central-1',
	});
	s3.upload( {
		Body: body,
		Bucket: S3Conf.bucket,
		Key: S3Conf.dir + '/server/' + process.pid + '.txt'
	} ).send( function(err, data) {
		if( err ) {
			console.log( err );
		} else {
			console.log( 'Uploaded data successfully' );
		}
	} );
}