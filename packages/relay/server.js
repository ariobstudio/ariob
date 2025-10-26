;(function(){
	var cluster = require('cluster');
	if(cluster.isMaster){
	  return cluster.fork() && cluster.on('exit',function(){ cluster.fork(); require('./lib/crashed') });
	}

	var fs = require('fs'), env = process.env;

	// Use Gun from GitHub (latest version)
	var GUN = require('gun');
	require('gun/sea');
	require('gun/lib/radisk');

	var opt = {
		port: env.PORT || process.argv[2] || 8765,
		peers: env.PEERS && env.PEERS.split(',') || []
	};

	if(fs.existsSync((opt.home = require('os').homedir())+'/cert.pem')){
		env.HTTPS_KEY = env.HTTPS_KEY || opt.home+'/key.pem';
		env.HTTPS_CERT = env.HTTPS_CERT || opt.home+'/cert.pem';
	}
	if(env.HTTPS_KEY){
		opt.port = 443;
		opt.key = fs.readFileSync(env.HTTPS_KEY);
		opt.cert = fs.readFileSync(env.HTTPS_CERT);
		opt.server = require('https').createServer(opt, GUN.serve(__dirname));
		require('http').createServer(function(req, res){
			res.writeHead(301, {"Location": "https://"+req.headers['host']+req.url });
			res.end();
		}).listen(80);
	} else {
		opt.server = require('http').createServer(GUN.serve(__dirname));
	}

	var gun = GUN({
		web: opt.server.listen(opt.port),
		peers: opt.peers,
		radisk: true,  // Enable RadDisk storage
		file: 'radata'  // Storage directory
	});

	console.log('Relay peer started on port ' + opt.port + ' with /gun');
	console.log('Using Gun from GitHub: amark/gun');
	console.log('RadDisk enabled - storing data in radata/');

	module.exports = gun;
}());
