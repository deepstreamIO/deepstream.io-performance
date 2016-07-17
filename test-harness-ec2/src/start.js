if( process.env.ROLE === 'SERVER' ) {
	require( './server/runner' );
} else if( process.env.ROLE === 'CLIENT' ) {
	require( './client/runner' );
} else {
	console.error( 'Must set env variable ROLE to either SERVER or CLIENT' );
}