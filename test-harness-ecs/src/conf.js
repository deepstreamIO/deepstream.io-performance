module.exports = {
	server: {
		tcpPort: process.env.TCP_PORT || 6021,
		port: process.env.PORT || 6020,
		totalTestTime: process.env.TEST_TIME || -1,
		logLevel: process.env.LOG_LEVEL || 3
	},
	client: {
		deepStreamUrls: ( process.env.DEEPSTREAMS && process.env.DEEPSTREAMS.split(',') ) || [ 'localhost:6021' ],
		deepStreamClientPairs: process.env.CLIENT_PAIRS || 20,
		messageFrequency: process.env.MESSAGE_FREQUENCY || 20,
		messageLimit: process.env.MESSAGE_LIMIT || 200,
		spawningSpeed: process.env.SPAWNING_SPEED || 100,
		logLatency: process.env.LOG_LATENCY === 'true' || true
	},
	S3: {
		enabled: process.env.S3_ENABLED === 'true' || true,
		bucket: process.env.S3_BUCKET || 'ds-performance-results',
		dir: 'performance'
	}
}
