import './media/css/global.less';

/* tslint:enable no-unused-variable */
import * as electron from 'electron';
import dva from 'dva';
import createLoading from 'dva-loading';
import createHistory from 'history/createHashHistory';
import appModel from '../models/app';
import router from '../routes/router';

const ipc = electron.ipcRenderer;

global['__DEV__'] = !!process.env['APP_DEV'];

function registerListeners(enableDeveloperTools) {
    // Devtools & Reload support
    if (enableDeveloperTools) {
        var extractKey = function (e) {
            return [
                e.ctrlKey ? 'ctrl-' : '',
                e.metaKey ? 'meta-' : '',
                e.altKey ? 'alt-' : '',
                e.shiftKey ? 'shift-' : '',
                e.keyCode
            ].join('');
        };

        var TOGGLE_DEV_TOOLS_KB = (process.platform === 'darwin' ? 'meta-alt-73' : 'ctrl-shift-73'); // mac: Cmd-Alt-I, rest: Ctrl-Shift-I
        var RELOAD_KB = (process.platform === 'darwin' ? 'meta-82' : 'ctrl-82'); // mac: Cmd-R, rest: Ctrl-R

        window.addEventListener('keydown', function (e) {
            var key = extractKey(e);
            if (key === TOGGLE_DEV_TOOLS_KB) {
                ipc.send('app:toggleDevTools');
            } else if (key === RELOAD_KB) {
                ipc.send('app:reloadWindow');
            }
        });
    }
}

registerListeners(process.env['APP_DEV']);

function startup(): void {
    // 1. Initialize
    const app = dva({
        history: createHistory(),
        onError(error) {
            console.error(error.message);
        },
    });

    // 2. Plugins
    app.use(createLoading({ effects: true }));

    // 3. Model
    app.model(appModel);

    // 4. Router
    app.router(router);

    // 5. Start
    app.start('#main');
}

startup();