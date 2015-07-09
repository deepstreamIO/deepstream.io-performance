module.exports = {
	server: {
		deepstreams: [ 7000 ],
		host: 'ec2-52-28-187-183.eu-central-1.compute.amazonaws.com',
		spawningSpeed: 1000,
		totalTestTime: 10000,
		logLevel: 3
	},
	client: {
		deepStreamClientPairs: 1,
		messageFrequency: 0,
		messageLimit: 5000,
		spawningSpeed: 1000,
		showLatency: false,
		calculateLatency: false
	}
}
