import {loadSettings} from "../../framework/config";
import chokidar from "chokidar";
import {registerAvailableComponents} from "../../framework/loaders/component-loader";
import {clearCache} from "../../framework/cache/cache";
import {restartServer} from "../../framework";

const watchers = { };

const startWatchingComponentDirectories = async () => {
    console.log("Start watching component directories");

    const settings = await loadSettings();
    const componentBundles = settings.componentsDirectory;

    const directoriesToWatch = componentBundles.map(bundle => bundle.basePath);
    startWatchingDirectories("components", directoriesToWatch, (path) => {
        registerAvailableComponents();
    });
};

const startWatchingPagesDirectories = async () => {
    console.log("Start watching pages directories");

    const settings = await loadSettings();
    const directoriesToWatch = settings.pagesDirectory;

    startWatchingDirectories("pages", directoriesToWatch, (path) => {
        clearCache();
        restartServer();
    });
};

const startWatchingDirectories = (name, directories, callback) => {
    if (watchers[name]) {
        return;
    }

    const watcher = chokidar.watch(directories, { persistent: true, ignoreInitial: true, awaitWriteFinish: true, interval: 200 });
    watchers[name] = watcher;

    const watcherCallback = (path) => {
        delete require.cache[require.resolve(path)];
        callback(path);
    };

    watcher
        .on('change', path => {
            watcherCallback(path);
            console.log(`File ${path} has been changed.`)
        })
        .on('add', path => {
            watcherCallback(path);
            console.log(`File ${path} has been added.`)
        })
        .on('unlink', path => {
            watcherCallback(path);
            console.log(`File ${path} has been removed.`)
        })
}


export {
    startWatchingComponentDirectories,
    startWatchingPagesDirectories
}
