//Here for aws opsworks
if( process.env.server === true ) {
	require( './server/cluster' );
} else {
	require( './client/cluster' );
}
