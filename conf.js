module.exports = {
	server: {
		deepstreams: [ 7000 ],
		host: 'localhost',
		spawningSpeed: 1000,
		totalTestTime: 10000
	},
	client: {
		deepStreamClientPairs: 1,
		messageFrequency: 0,
		messageLimit: 5000,
		spawningSpeed: 1000,
		logClientLatency: false
	}
}
