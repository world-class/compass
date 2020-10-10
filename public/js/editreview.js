import { SessionOptions } from './modules/SessionOptions.js';

//run everything dependent on jQuery in here
jQuery(document).ready(function(){
    new SessionOptions("session"); //make sessions
    const session = JSON.parse(reviewSession) //get session
    $('#session').selectpicker('val', session); //set as selected
});