import { SessionOptions } from './modules/SessionOptions.js';

new SessionOptions("session"); //make sessions
const session = JSON.parse(reviewSession) //get session
$('#session').selectpicker('val', session); //set as selected