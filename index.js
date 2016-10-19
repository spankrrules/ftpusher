var fs = require('fs-extra');
var path = require('path');
var argv = require('yargs').argv;
var chokidar = require('chokidar');
var winston  = require('winston');
var moment   = require('moment');

// setup logger
winston.add(require('winston-daily-rotate-file'), {
    filename: './logs/app.log',
    zippedArchive: true
});


// setup chowkidar watcher
var backupFolder  = path.resolve('./backup');
var folderToWatch = '.';
folderToWatch = (argv.length > 1)? path.resolve(argv._[0]) : path.resolve(folderToWatch);
var watcher = chokidar.watch(folderToWatch, {
    ignored: [/[\/\\]\./],
    ignoreInitial: true,
    awaitWriteFinish: true,
    depth: 0
});


// start watching for files
winston.info('Watching folder: ', folderToWatch);
watcher.on('add', fileAdded);


////////////////////
function fileAdded(file, event) {
    winston.info(`File ${file} has been added`);
    moveFile(file);
}

function moveFile(file) {
    var name = path.basename(file);
    var moveHere = backupFolder +'/'+ moment().format('YYYY-MM-DD') +'/'+ name;
    fs.move(file, moveHere, { clobber: true }, function (err) {
        if (err) return winston.error(err);
        winston.info(`File moved to ${moveHere}`);
    });
}
