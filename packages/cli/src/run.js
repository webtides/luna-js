import { spawn } from 'child_process';
import path from "path";

import {loadSettings} from "@webtides/luna-js/src/framework/config";
import {getConfig} from "./config";

let currentLunaProcess = null;
let waitForProcessToBeKilled = null;

const startLunaJS = async () => {
    if (currentLunaProcess !== null) {

        waitForProcessToBeKilled.then(() => startLunaJS());

        currentLunaProcess.kill();
        currentLunaProcess = null;
        return;
    }

    const settings = await loadSettings();
    const { baseDirectory } = settings._generated;

    const generatedStartScript = path.join(
        getConfig().currentWorkingDirectory,
        baseDirectory,
        'start.js',
    );

    const child = spawn('node', [ generatedStartScript ]);

    child.stdout.pipe(process.stdout);
    child.stdin.pipe(process.stdin);
    child.stderr.pipe(process.stderr);

    child.stdout.on('data', (data) => {
        console.log(new String(data));
    });

    waitForProcessToBeKilled = new Promise((resolve) => {
        child.on('close', () => {
            resolve();
        });
    });

    currentLunaProcess = child;
};

const stopLunaJS = async () => {
    if (currentLunaProcess !== null) {
        currentLunaProcess.kill();
        currentLunaProcess = null;
    }
};

export { startLunaJS, stopLunaJS };
