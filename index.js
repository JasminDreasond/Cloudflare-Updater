const startServer = async function () {

    // Modules
    const path = require('path');
    const fs = require('fs');
    const ini = require('ini');
    const moment = require('moment');
    const consoleGenerator = function (name, value) { return `[${moment().format('HH:mm:ss')}] [${name}]: ${value}`; };
    let dnsID = null;
    console.log(consoleGenerator('Cloudflare-Updater', 'Starting App...'));

    // Files
    const rootPath = path.dirname(process.execPath);
    console.log(consoleGenerator('Cloudflare-Updater', `App Path: ${rootPath}`));
    console.log(consoleGenerator('Cloudflare-Updater', `Loading Config...`));
    const tinyCfg = ini.parse(fs.readFileSync(path.join(rootPath, './cloudflare-updater.ini'), 'utf-8'));
    if (typeof tinyCfg.autochecker !== "string" && typeof tinyCfg.autochecker !== "number") { tinyCfg.autochecker = 30; } else { tinyCfg.autochecker = Number(tinyCfg.autochecker); }
    console.log(consoleGenerator('Cloudflare-Updater', `Config Loaded!`));

    // Cloudflare Module
    console.log(consoleGenerator('Cloudflare-Updater', `Starting Cloudflare API...`));
    const cf = require('cloudflare')({
        email: tinyCfg.email,
        key: tinyCfg.key
    });

    // DNS Editor
    const dnsEditorSend = async function() {

        // Get List
        if(!dnsID) {

            // Get List
            const dnsList = await cf.browse(tinyCfg.zone);
            console.log(dnsList);

        }

        // Complete
        return;

    };

    // Start Checker
    setInterval(dnsEditorSend, tinyCfg.autochecker);
    await dnsEditorSend();
    console.log(consoleGenerator('Cloudflare-Updater', `Cloudflare API started!`));

    // Complete
    return;

};

// Start
startServer();