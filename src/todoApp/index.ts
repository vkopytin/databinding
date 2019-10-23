import * as BB from 'backbone';
import * as $ from 'jquery';
import { TodoRouter } from './routers/router';
import './css/main.css';
import template = require('./index.mustache');


$('body').html(template());

new TodoRouter();
BB.history.start();
