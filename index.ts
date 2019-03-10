import {exec} from "child_process";

const CDP = require('chrome-remote-interface');

const debuggerEvents = [
    ['paused', 'reason'],
    'breakpointResolved',
    'resumed',
    'scriptFailedToParse',
//    ['scriptParsed', 'url'],
];


async function delay(time) {
    console.log(`Delay ${time}`);
    await new Promise(resolve => setTimeout(resolve, time));
}

async function main() {
    const nodeCommand = 'git clean -fd && git reset --hard && node --inspect-brk=9222 ./node_modules/@angular/cli/bin/ng g prettify-schematic:my-schematic';

const doExec = true;
    if (doExec) {
        exec(nodeCommand, {
                cwd: '../test-prettify-schematics'
            },
            (error, stdout, stderr) =>
                console.log('Exec: ', error ? `${error} : ${stderr}` : 'XXX' /*'Executed successfully!'*/));
    }

    await delay(2000);

    CDP(async (client: any) => {
        debugger;

        const {Debugger, Runtime} = client;
        try {

            debuggerEvents.forEach(event => {
                const eventName = Array.isArray(event) ? event[0] : event;
                const displayProperty = Array.isArray(event) && event[1];
                client.Debugger[eventName]((eventData: any) => console.log.apply(console, ['Debugger ' + event, displayProperty ? eventData[displayProperty] : eventData]));
            });

            Debugger.paused(() => {
                console.log('Debugger paused');
                client.Debugger.resume();
                // client.close();
            });


            client.Debugger.scriptParsed((script: any) => {
                console.log(`Debugger scriptParsed: ${script.url}`);
                if (script.url.indexOf('file-system-engine-host-base') > 0) {
                    debugger;
                }
            });

            console.log('before runIfWaitingForDebugger');

            // await delay(1000);
            console.log('after runIfWaitingForDebugger');
            // await delay(1000);
            await Runtime.runIfWaitingForDebugger();
            await Debugger.enable();

            Debugger.setBreakpointByUrl({
                lineNumber: 0,
                urlRegex: 'base.js'
            }, (...result: any[]) => {
                console.log(result);
                debugger;
            });

            //            console.log('after runIfWaitingForDebugger');
        } catch (err) {
            console.error(err);
        } finally {
            console.log('finally - close');
            // client.close();
        }
    }).on('error', (err) => {
        console.error(err);
    });

}

main();


// angular-cli/packages/angular_devkit/schematics/tools/file-system-engine-host-base.ts
// angular-cli/packages/angular_devkit/schematics/tools/export-ref.ts
// angular-cli/packages/angular/cli/commands/generate-impl.ts
