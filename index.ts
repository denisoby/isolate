import {exec} from "child_process";

const CDP = require('chrome-remote-interface');

async function main() {
    const nodeCommand = 'git clean -fd && git reset --hard && node --inspect-brk=9222 ./node_modules/@angular/cli/bin/ng g prettify-schematic:my-schematic';
    exec(nodeCommand, {
            cwd: '../test-prettify-schematics'
        },
        (error, stdout, stderr) => console.log('Exec: ', error, stdout, stderr));

    await new Promise(resolve => setTimeout(resolve, 5000));

    CDP(async (client) => {
        debugger;

        const {Debugger, Runtime} = client;
        try {
            client.Debugger.paused(() => {
                console.log('Debugger paused');
                // client.Debugger.resume();
                client.close();
            });
            console.log('before runIfWaitingForDebugger');
            await client.Runtime.runIfWaitingForDebugger();
            console.log('after runIfWaitingForDebugger');
            await client.Debugger.enable();
            console.log('after runIfWaitingForDebugger');
        } catch (err) {
            console.error(err);
        } finally {
            client.close();
        }
    }).on('error', (err) => {
        console.error(err);
    });

}

main();
