module.exports = [];

var s = 'ABCDEFGHIJK', i, j, currencyPairs;

for( i = 0; i < s.length; i++ ) {
	for( j = 0; j < s.length - 1; j++ ) {
		if( s[ i ] === s[ j ] ) {
			continue;
		}
		module.exports.push( s[ i ] + s[ i ] + s[ i ] + s[ j ] + s[ j ] + s[ j ] );
	}
}

