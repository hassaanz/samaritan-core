var chokidar = require('chokidar');

var path = '/tmp/'

var filesWatcher = chokidar.watch(path);

filesWatcher
	.on('add', function(path, stat) {
		
	})