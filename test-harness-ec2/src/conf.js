module.exports = {
	server: {
		deepstreamCmd: process.env.DEEPSTREAM_CMD || 'deepstream',
		deepstreamLib: process.env.DEEPSTREAM_LIB || '/var/lib/deepstream',
		totalTestTime: process.env.TEST_TIME || -1
	},
	client: {
		deepStreamUrls: ( process.env.DEEPSTREAMS && process.env.DEEPSTREAMS.split(',') ) || [ 'localhost:6021' ],
		deepStreamClientPairs: process.env.CLIENT_PAIRS || 100000,
		messageFrequency: process.env.MESSAGE_FREQUENCY || 200,
		messageLimit: process.env.MESSAGE_LIMIT || 5,
		spawningSpeed: process.env.SPAWNING_SPEED || 1000,
		logLatency: process.env.LOG_LATENCY === 'true' || true,
	},
	S3: {
		enabled: process.env.S3_ENABLED === 'true' || false,
		bucket: process.env.S3_BUCKET || 'ds-performance-results',
		dir: 'performance'
	}
}
