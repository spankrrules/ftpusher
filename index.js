var fs = require('fs-extra');
var path = require('path');
var argv = require('yargs').argv;
var chokidar = require('chokidar');
var winston  = require('winston');
var moment   = require('moment');
var JSFtp    = require('jsftp');


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


var ftpSettings = {
    host: 'ftp.mpenv.com',
    user: 'solaramc',
    pass: 'solaramc@mpenv'
};



// start watching for files
winston.info('Watching folder: ', folderToWatch);
watcher.on('add', fileAdded);


////////////////////
function fileAdded(file, event) {
    winston.info(`File ${file} has been added`);
    sendFile(file, moveFile);
}

function sendFile(file, cb) {
    fs.readFile(file, (err, data) => {
        if (err) throw err;

        var location = './samcData/'+ path.basename(file);
        var ftp = new JSFtp(ftpSettings);
        ftp.put(data, location, (err) => {
            if (err) throw err;
            winston.info('file uploaded to '+ location);
            if(cb) cb(file);
        });
    });
}

function moveFile(file, cb) {
    var name = path.basename(file);
    var moveHere = backupFolder +'/'+ moment().format('YYYY-MM-DD') +'/'+ name;

    fs.move(file, moveHere, { clobber: true }, (err) => {
        if (err) throw err;
        winston.info(`File moved to ${moveHere}`);
        if(cb) cb();
    });
}
