import express = require('express');
import config = require('./config');

/**
 * Create our app w/ express
 */
const app = config(express());

export { app };
