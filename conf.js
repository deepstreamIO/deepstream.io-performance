module.exports = {
	server: {
		deepstreams: [ 7000 ],
		host: 'ec2-52-28-25-217.eu-central-1.compute.amazonaws.com',
		spawningSpeed: 1000,
		totalTestTime: 10000,
		logLevel: 3
	},
	client: {
		deepStreamClientPairs: 25,
		messageFrequency: 25,
		messageLimit: 500,
		spawningSpeed: 100,
		logLatency: true,
		calculateLatency: true
	}
}
