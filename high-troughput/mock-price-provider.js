var net = require( 'net' );
var connection = net.createConnection({ port: 6010, host: 'localhost' }, onConnect );
var currencyPairs = require( './currency-pairs' );
var updateCount = 0;
var interval = parseInt( process.argv[ 2 ], 10 );
var totalUpdates = parseInt( process.argv[ 3 ], 10 );
var updateIntervalId;

if( isNaN( interval ) ) {
	throw new Error( 'Missing interval' );
}

if( isNaN( totalUpdates ) ) {
	throw new Error( 'Missing totalUpdates' );
}

function onConnect() {
	connection.setEncoding( 'utf8' );
	updateIntervalId = setInterval( sendUpdates, interval );
}

function sendUpdates() {
	for( var i = 0; i < currencyPairs.length; i++ ) {
		updateCount++;
		connection.write( [ currencyPairs[ i ], updateCount, updateCount, Date.now() ].join( ',' ) + '|'  );
	}

	if( updateCount >= totalUpdates ) {
		clearInterval( updateIntervalId );
		console.log( 'Done!. Send ' + updateCount + ' updates ' );
	}
}

console.log( 'Sending ' + currencyPairs.length + ' updates every ' + interval + 'ms' );
console.log( 'Up to a total of ' + totalUpdates );