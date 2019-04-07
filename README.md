# deepstream.io-performance

[![Greenkeeper badge](https://badges.greenkeeper.io/deepstreamIO/deepstream.io-performance.svg)](https://greenkeeper.io/)

A performance harness for deepstream.io

Details on options can be seen [here](deepstream.io/info/performance-overview.html )

To start server: 

```sh 
cd test-harness
./install-redis.sh
npm install
node server/cluster.js
```

To start clients:
```sh 
cd test-harness
npm install
node client/cluster.js
```
