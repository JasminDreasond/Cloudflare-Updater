const startServer = async function () {

    // Modules
    const path = require('path');
    const fs = require('fs');
    const ini = require('ini');
    const moment = require('moment');
    const consoleGenerator = function (name, value) { return `[${moment().format('HH:mm:ss')}] [${name}]: ${value}`; };
    let dnsData = null;
    console.log(consoleGenerator('Cloudflare-Updater', 'Starting App...'));

    // Files
    const rootPath = path.dirname(process.execPath);
    console.log(consoleGenerator('Cloudflare-Updater', `App Path: ${rootPath}`));
    console.log(consoleGenerator('Cloudflare-Updater', `Loading Config...`));

    let tinyCfg = null;
    try {
        tinyCfg = ini.parse(fs.readFileSync(path.join(rootPath, './cloudflare-updater.ini'), 'utf-8'));
    } catch (err) { try { tinyCfg = ini.parse(fs.readFileSync(path.join(__dirname, './test/cloudflare-updater.ini'), 'utf-8')); } catch (err) { throw err; } }

    if (typeof tinyCfg.autochecker !== "string" && typeof tinyCfg.autochecker !== "number") { tinyCfg.autochecker = 30; } else { tinyCfg.autochecker = Number(tinyCfg.autochecker); }
    console.log(consoleGenerator('Cloudflare-Updater', `Config Loaded!`));

    // Cloudflare Module
    console.log(consoleGenerator('Cloudflare-Updater', `Starting Cloudflare API...`));
    const cf = require('cloudflare')({
        email: tinyCfg.email,
        key: tinyCfg.key
    });

    // DNS
    const dns = cf.dnsRecords;
    const publicIp = require('public-ip');

    // Get DNS 
    const getDNSList = async function (page = 1) {

        // Get List
        const dnsList = await dns.browse(tinyCfg.zone);

        // Get Item
        dnsData = dnsList.result.find(dnsItem => dnsItem.name === tinyCfg.domain);
        //if (dnsData) { return; } else { page++; await getDNSList(page); return; }
        return;

    };

    // DNS Editor
    const dnsEditorSend = async function () {

        // Starting
        console.log(consoleGenerator('Cloudflare-Updater', `Starting DNS Update...`));

        // Get IP
        const ip = await publicIp[tinyCfg.iptype]();
        console.log(ip);

        // Get List
        if (!dnsData) {

            // Get List
            console.log(consoleGenerator('Cloudflare-Updater', `Getting DNS List...`));
            await getDNSList();
            
            // Detected
            if(dnsData) {
                console.log(consoleGenerator('Cloudflare-Updater', `Domain "${tinyCfg.domain}" found! This domain is using the IP "${dnsData.content}".`));
            } else {
                console.log(consoleGenerator('Cloudflare-Updater', `Domain "${tinyCfg.domain}" not found.`));
            }

        }

        // Complete
        console.log(consoleGenerator('Cloudflare-Updater', `DNS Update complete!`));
        return;

    };

    // Start Checker
    setInterval(dnsEditorSend, Number(60000 * tinyCfg.autochecker));
    await dnsEditorSend();
    console.log(consoleGenerator('Cloudflare-Updater', `Cloudflare API started!`));

    // Complete
    return;

};

// Start
startServer();