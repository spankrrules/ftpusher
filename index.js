var path = require('path');
var argv = require('yargs').argv;
var chokidar = require('chokidar');
var log = console.log.bind(console);

var folderToWatch = '.';
folderToWatch = (argv.length > 1)? path.resolve(argv._[0]) : path.resolve(folderToWatch);

console.log('Watching folder: ', folderToWatch);
var watcher = chokidar.watch(folderToWatch, {
  ignored: [/[\/\\]\./],
  ignoreInitial: true,
  awaitWriteFinish: true,
  depth: 0
});

watcher.on('add', fileAdded);

//////////

function fileAdded(path) {
  log(`File ${path} has been added`);
}
