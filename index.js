const startServer = async function () {

    // Modules
    const path = require('path');
    const fs = require('fs');
    const ini = require('ini');
    const moment = require('moment');
    const consoleGenerator = function (name, value) { return `[${moment().format('HH:mm:ss')}] [${name}]: ${value}`; };
    console.log(consoleGenerator('Cloudflare-Updater', 'Starting App...'));

    // Files
    const rootPath = path.dirname(process.execPath);
    console.log(consoleGenerator('Cloudflare-Updater', `App Path: ${rootPath}`));
    console.log(consoleGenerator('Cloudflare-Updater', `Loading Config...`));
    const tinyCfg = ini.parse(fs.readFileSync(path.join(rootPath, './cloudflare-updater.ini'), 'utf-8'));
    if (typeof tinyCfg.autochecker !== "string" && typeof tinyCfg.autochecker !== "number") { tinyCfg.autochecker = 30; } else { tinyCfg.autochecker = Number(tinyCfg.autochecker); }
    console.log(consoleGenerator('Cloudflare-Updater', `Config Loaded!`));

    // Cloudflare Module
    const cf = require('cloudflare')({
        email: tinyCfg.email,
        key: tinyCfg.key
    });

    // Complete
    return;

};

// Start
startServer();