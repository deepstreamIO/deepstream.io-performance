module.exports = {
	server: {
		port: 6021,
		totalTestTime: process.env.TEST_TIME || 5000,
		logLevel: process.env.LOG_LEVEL || 3
	},
	client: {
		deepStreamUrls: ( process.env.DEEPSTREAMS && process.env.DEEPSTREAMS.split(',') ) || [ 'localhost:6021' ],
		deepStreamClientPairs: process.env.CLIENT_PAIRS || 20,
		messageFrequency: process.env.MESSAGE_FREQUENCY || 20,
		messageLimit: process.env.MESSAGE_LIMIT || 200,
		spawningSpeed: process.env.SPAWNING_SPEED || 100,
		logLatency: process.env.LOG_LATENCY || true
	},
	S3: {
		enabled: true,
		bucket: 'ds-performance-results',
		dir: 'performance'
	}
}
