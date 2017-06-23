import * as jointjs from 'jointjs';
import $ from 'jquery';
require('./style.css');

$('document').ready(() => {
    $('div').text('text');

    $('body').click(ev => {
        console.log(ev);
    });
});
