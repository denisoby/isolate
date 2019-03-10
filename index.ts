const CDP = require('chrome-remote-interface');

CDP(async(client) => {
    debugger;

    const {Debugger, Runtime} = client;
    try {
        client.Debugger.paused(() => {
            console.log('Debugger paused');
            client.Debugger.resume();
            client.close();
        });
        console.log('before runIfWaitingForDebugger');
        await client.Runtime.runIfWaitingForDebugger();
        console.log('after runIfWaitingForDebugger');
        await client.Debugger.enable();
        console.log('after debugger enabled');
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}).on('error', (err) => {
    console.error(err);
});
