var spawn = require('child_process').spawn;
var conf = require( '../conf' ).server;
var fs = require('fs');
var zlib = require('zlib');

var performanceUsage;
var deepstream = spawn( conf.deepstreamCmd, [ 'start', '-c', './configs/default.yml', '-l', conf.deepstreamLib ] );

deepstream.stdout.on('data', (data) => {
	console.log(`stdout: ${data}`);
});

deepstream.stderr.on('data', (data) => {
	console.log(`stderr: ${data}`);
});

deepstream.on('error', (err) => {
	console.log( 'Failed to start child process.', err );
});

deepstream.on('close', (code) => {
	console.log(`child process exited with code ${code}`);
	onDeepstreamStopped();
});

if( conf.totalTestTime !== -1 ) {
	setTimeout( function() {
		deepstream.kill();
	}, conf.totalTestTime );
}

setTimeout( () => {
	onDeepstreamStarted();
}, 2000 );

function onDeepstreamStarted() {
	console.log( 'deepstream server with PID:' + deepstream.pid );
	performanceUsage = spawn( 'bash' );
	performanceUsage.stdin.write( 'rm -rf ../stats && mkdir ../stats\n' );
	performanceUsage.stdin.write( 'top -p ' + deepstream.pid + ' -b -d 1 > ../stats/' + deepstream.pid + '.txt\n' );
}

function onDeepstreamStopped() {
	if( performanceUsage ) {
		console.log( 'Server Performance Tests Finished' );
		performanceUsage.stdin.end();
		saveToS3();
	}
}

function saveToS3() {
	var S3Conf = require( '../conf' ).S3;

	if( !S3Conf.enabled ) {
		return;
	}

	var AWS = require( 'aws-sdk' );
	var body = fs.createReadStream( '../stats/' + process.pid + '.txt' ).pipe( zlib.createGzip() );
	var s3 = new AWS.S3({
		endpoint: 's3-eu-central-1.amazonaws.com',
		signatureVersion: 'v4',
		region: 'eu-central-1',
	});
	s3.upload( {
		Body: body,
		Bucket: S3Conf.bucket,
		Key: S3Conf.dir + '/server/' + deepstream.pid + '.txt'
	} ).send( function(err, data) {
		if( err ) {
			console.log( err );
		} else {
			console.log( 'Uploaded data successfully' );
		}
	} );
}