import $ from 'jquery';
import can from 'can';
import template from './template.stache!';
import viewModel from './view-model';
import './styles.less!';

can.Component({
  tag: 'settings-component',
  viewModel: viewModel,
  template: template,
  events: {
    'inserted': function(){
      console.log('SETTINGS-COMPONENT inserted!');

      $('.selectpicker').selectpicker({style: 'btn-form btn-sm'});
    }
  }
});