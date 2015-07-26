module.exports = {
	server: {
		deepstreams: ( process.env.DEEPSTREAMS && process.env.DEEPSTREAMS.split(',') ) || [ 6021 ],
		host: process.env.HOST || 'localhost',
		spawningSpeed: process.env.SPAWNING_SPEED || 1000,
		totalTestTime: process.env.TEST_TIME || 100000,
		logLevel: process.env.LOG_LEVEL || 3
	},
	client: {
		deepStreamClientPairs: process.env.CLIENT_PAIRS || 20,
		messageFrequency: process.env.MESSAGE_FREQUENCY || 25,
		messageLimit: process.env.MESSAGE_LIMIT || 200,
		spawningSpeed: process.env.SPAWNING_SPEED || 100,
		logLatency: process.env.LOG_LATENCY || true,
		calculateLatency: process.env.CALCULATE_LATENCY || true
	}
}
