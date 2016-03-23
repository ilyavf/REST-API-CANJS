import can from 'can';
import template from './template.stache!';
import viewModel from './view-model';
import './styles.less!';

can.Component({
  tag: 'forgot-password-component',
  viewModel: viewModel,
  template: template,
  events: {
    'inserted': function(){
      console.log('FORGOT-PASSWORD-COMPONENT inserted!');
    }
  }
});