;(function(){
	var cluster = require('cluster');
	if(cluster.isMaster){
	  return cluster.fork() && cluster.on('exit',function(){ cluster.fork(); require('./lib/crashed') });
	}

	var fs = require('fs'), path = require('path'), env = process.env;

	// Use Gun from GitHub (latest version)
	var GUN = require('gun');
	require('gun/sea');
	require('gun/lib/radisk');

	var opt = {
		port: env.PORT || process.argv[2] || 8765,
		peers: env.PEERS && env.PEERS.split(',') || []
	};

	// Models directory for ExecuTorch .pte files
	var modelsDir = path.join(__dirname, 'models');

	// Serve static files with CORS support for models
	function serveStatic(req, res, next) {
		// Handle models requests
		if (req.url.startsWith('/models/')) {
			var filePath = path.join(modelsDir, req.url.replace('/models/', ''));

			// Security: prevent directory traversal
			if (!filePath.startsWith(modelsDir)) {
				res.writeHead(403);
				res.end('Forbidden');
				return;
			}

			fs.stat(filePath, function(err, stats) {
				if (err || !stats.isFile()) {
					res.writeHead(404);
					res.end('Not found');
					return;
				}

				// CORS headers for model files
				res.setHeader('Access-Control-Allow-Origin', '*');
				res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
				res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
				res.setHeader('Access-Control-Expose-Headers', 'Content-Length, Content-Range');

				// Handle OPTIONS preflight
				if (req.method === 'OPTIONS') {
					res.writeHead(204);
					res.end();
					return;
				}

				// Handle HEAD request
				if (req.method === 'HEAD') {
					res.setHeader('Content-Length', stats.size);
					res.setHeader('Content-Type', getContentType(filePath));
					res.writeHead(200);
					res.end();
					return;
				}

				// Handle Range requests for large model files
				var range = req.headers.range;
				if (range) {
					var parts = range.replace(/bytes=/, '').split('-');
					var start = parseInt(parts[0], 10);
					var end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
					var chunkSize = end - start + 1;

					res.setHeader('Content-Range', 'bytes ' + start + '-' + end + '/' + stats.size);
					res.setHeader('Accept-Ranges', 'bytes');
					res.setHeader('Content-Length', chunkSize);
					res.setHeader('Content-Type', getContentType(filePath));
					res.writeHead(206);

					fs.createReadStream(filePath, { start: start, end: end }).pipe(res);
				} else {
					res.setHeader('Content-Length', stats.size);
					res.setHeader('Content-Type', getContentType(filePath));
					res.writeHead(200);
					fs.createReadStream(filePath).pipe(res);
				}
			});
			return;
		}

		// Pass to GUN for other requests
		next(req, res);
	}

	function getContentType(filePath) {
		var ext = path.extname(filePath).toLowerCase();
		var types = {
			'.pte': 'application/octet-stream',
			'.json': 'application/json',
			'.bin': 'application/octet-stream',
		};
		return types[ext] || 'application/octet-stream';
	}

	// Wrap GUN.serve with our static file handler
	var gunServe = GUN.serve(__dirname);
	function handler(req, res) {
		serveStatic(req, res, function() {
			gunServe(req, res);
		});
	}

	if(fs.existsSync((opt.home = require('os').homedir())+'/cert.pem')){
		env.HTTPS_KEY = env.HTTPS_KEY || opt.home+'/key.pem';
		env.HTTPS_CERT = env.HTTPS_CERT || opt.home+'/cert.pem';
	}
	if(env.HTTPS_KEY){
		opt.port = 443;
		opt.key = fs.readFileSync(env.HTTPS_KEY);
		opt.cert = fs.readFileSync(env.HTTPS_CERT);
		opt.server = require('https').createServer(opt, handler);
		require('http').createServer(function(req, res){
			res.writeHead(301, {"Location": "https://"+req.headers['host']+req.url });
			res.end();
		}).listen(80);
	} else {
		opt.server = require('http').createServer(handler);
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
	console.log('Models served from: ' + modelsDir);

	module.exports = gun;
}());
