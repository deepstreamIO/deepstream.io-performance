module.exports = {
	server: {
		deepstreams: [ 7000, 7001, 7002 ],
		host: 'ec2-52-28-146-161.eu-central-1.compute.amazonaws.com',
		spawningSpeed: 1000,
		totalTestTime: 10000,
		logLevel: 3
	},
	client: {
		deepStreamClientPairs: 125,
		messageFrequency: 25,
		messageLimit: 20000,
		spawningSpeed: 100,
		logLatency: true,
		calculateLatency: true
	}
}
