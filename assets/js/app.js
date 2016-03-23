import $ from 'jquery';
import can from 'can';
import pace from 'pace';
import 'components/login-component/';
import 'components/signup-component/';
import 'components/forgot-password-component/';
import 'components/settings-component/';
import 'bootstrap-select';
import 'bootstrap';
import AppVM from './app-view-model';
import appTemplate from './templates/main.stache!';

$(function () {
  pace.start({ajax: false});

  var appVM = new AppVM();
  $('#spa-app').html(appTemplate(appVM));

  //Routing:
  can.route.map(appVM);
  can.route(':page');
  can.route.ready();

  // Init App
  appVM.start();
});