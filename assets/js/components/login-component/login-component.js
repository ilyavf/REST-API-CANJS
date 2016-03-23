import can from 'can';
import template from './template.stache!';
import viewModel from './view-model';
import './styles.less!';

can.Component({
  tag: 'login-component',
  viewModel: viewModel,
  template: template,
  events: {
    'inserted': function(){
      console.log('LOGIN-COMPONENT inserted!');
    }
  }
});