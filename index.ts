import {exec} from "child_process";

const CDP = require('chrome-remote-interface');

const debuggerEvents = [
    ['paused', 'reason'],
    'breakpointResolved',
    'resumed',
    'scriptFailedToParse',
//    ['scriptParsed', 'url'],
];


async function delay(time: number) {
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
        const {Debugger, Runtime} = client;
        try {

            debuggerEvents.forEach(event => {
                const eventName = Array.isArray(event) ? event[0] : event;
                const displayProperty = Array.isArray(event) && event[1];
                client.Debugger[eventName]((eventData: any) => console.log.apply(console, ['Debugger ' + event, displayProperty ? eventData[displayProperty] : eventData]));
            });

            Debugger.paused((event: any) => {
                if (event.reason === "Break on start") {
                    return client.Debugger.resume();
                }
                debugger;
                console.log('Debugger paused: ', event.reason);
                client.Debugger.resume();
                // client.close();
            });

            Debugger.breakpointResolved((event: any) => {
                console.log('breakpointResolved: ', event);
                client.Debugger.resume();
                // client.close();
            });


            client.Debugger.scriptParsed((script: any) => {
                // console.log(`Debugger scriptParsed: ${script.url}`);
                if (script.url.indexOf('base.js') > 0) {
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
    }).on('error', (err: any) => {
        console.error(err);
    });

}

main();


// angular-cli/packages/angular_devkit/schematics/tools/file-system-engine-host-base.ts
// angular-cli/packages/angular_devkit/schematics/tools/export-ref.ts
// angular-cli/packages/angular/cli/commands/generate-impl.ts


// script parsed
// let x = {
//     "scriptId": "570",
//     "url": "/Users/dobydennykh/dev/test-prettify-schematics/node_modules/fsevents/node_modules/are-we-there-yet/tracker-base.js",
//     "startLine": 0,
//     "startColumn": 0,
//     "endLine": 12,
//     "endColumn": 3,
//     "executionContextId": 1,
//     "hash": "08328883401BE4171FB7B2461292B5068C09E644",
//     "isLiveEdit": false,
//     "sourceMapURL": "",
//     "hasSourceURL": false,
//     "isModule": false,
//     "length": 340,
//     "stackTrace": {
//         "callFrames": [{
//             "functionName": "createScript",
//             "scriptId": "46",
//             "url": "vm.js",
//             "lineNumber": 79,
//             "columnNumber": 9
//         }]
//     }
// }
