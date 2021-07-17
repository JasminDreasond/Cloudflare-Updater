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
    if (typeof tinyCfg.domainid === "string" && tinyCfg.domainid.length > 0) { dnsData = { id: tinyCfg.domainid }; }
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

        // Get IP
        const ip = await publicIp[tinyCfg.iptype]();

        // Validator
        if (!dnsData || !dnsData.content || dnsData.content !== ip) {

            // Starting
            console.log(consoleGenerator('Cloudflare-Updater', `Starting DNS Update...`));

            // Get List
            if (!dnsData) {

                // Get List
                console.log(consoleGenerator('Cloudflare-Updater', `Getting DNS List...`));
                await getDNSList();

                // Detected
                if (dnsData) {
                    console.log(consoleGenerator('Cloudflare-Updater', `Domain "${tinyCfg.domain}" found! This domain is using the IP "${dnsData.content}".`));
                } else {
                    console.log(consoleGenerator('Cloudflare-Updater', `Domain "${tinyCfg.domain}" not found.`));
                }

            }

            // Get More Information
            else if (!dnsData.content) {
                console.log(consoleGenerator('Cloudflare-Updater', `Getting "${tinyCfg.domain}"...`));
                const data = await dns.read(tinyCfg.zone, dnsData.id);
                if (data && data.result) { dnsData = data.result; }
                console.log(consoleGenerator('Cloudflare-Updater', `Done!`));
            }

            // Update IP
            if (dnsData) {

                // Edit Domain
                console.log(consoleGenerator('Cloudflare-Updater', `Updating "${tinyCfg.domain}"...`));

                await dns.edit(tinyCfg.zone, dnsData.id, {
                    content: ip,
                    type: dnsData.type,
                    name: dnsData.name,
                    ttl: dnsData.ttl,
                    proxied: false
                });

                console.log(consoleGenerator('Cloudflare-Updater', `Done!`));

            }

            // Success
            console.log(consoleGenerator('Cloudflare-Updater', `DNS Update complete!`));

        }

        // Complete
        return;

    };

    // Close Await
    const closeAwait = async function () {

        // Edit Domain
        console.log(consoleGenerator('Cloudflare-Updater', `Updating "${tinyCfg.domain}" to the safe mode...`));

        await dns.edit(tinyCfg.zone, dnsData.id, {
            content: ip,
            type: dnsData.type,
            name: dnsData.name,
            ttl: dnsData.ttl,
            proxied: false
        });

        console.log(consoleGenerator('Cloudflare-Updater', `Done! You can close the app now.`));

        // Complete
        return;

    };

    // Close Script
    process.on('exit', closeAwait);
    process.on('close', closeAwait);

    // ON Death
    require('death')(async function (signal, err) {

        // Closing Message
        console.log(consoleGenerator('Mine-Drive', `Closing App: ${signal}`));
        if (err) { console.error(err); }
        await minecraft.server.stop();
        await closeAwait();
        return;

    });

    // Start Checker
    setInterval(dnsEditorSend, Number(60000 * tinyCfg.autochecker));
    await dnsEditorSend();
    console.log(consoleGenerator('Cloudflare-Updater', `Cloudflare API started!`));

    // Complete
    return;

};

// Start
startServer();