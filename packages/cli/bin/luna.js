#!/usr/bin/env node

import { execute } from "../src/index.js";
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).argv;

execute(argv);
