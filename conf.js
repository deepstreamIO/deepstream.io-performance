module.exports = {
	server: {
		deepstreams: [ 7000 ],
		host: 'localhost',
		spawningSpeed: 1000
	},
	client: {
		deepstreamClientsAmount: 10,
		messageFrequency: 0,
		messageLimit: 5000,
		spawningSpeed: 1000
	}
}
