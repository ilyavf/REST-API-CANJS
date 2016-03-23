import can from 'can';
import 'can/map/define/';

import config from 'config';
import i18n from 'i18n-nls/main';
import restAPI from 'rest-api';

export default can.Map.extend({
  languages: config.languages,
  i18n: i18n,
  buttonRunning: null,
  inputDisabled: null,
  saveSettings: function() {



  },
  newLanguage: null,
  passwordChange: '',
  passwordRetypedChange: '',
  passwordStrengthGood: false,
  passwordStrengthText: '',
  passwordStrengthColor: 'red-text',
  passwordMismatchError: false,
  strongPassFunc: function(pass) {

    if (pass != '') {
      var strongRegex = new RegExp("^(?=.{12,})(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*\\W).*$", "g");
      var mediumRegex = new RegExp("^(?=.{10,})(((?=.*[A-Z])(?=.*[a-z]))|((?=.*[A-Z])(?=.*[0-9]))|((?=.*[a-z])(?=.*[0-9]))).*$", "g");
      var enoughRegex = new RegExp("(?=.{8,}).*", "g");
      if (false == enoughRegex.test(pass)) {
        this.attr("passwordStrengthText", i18n.longerPasswordNeeded);
        this.attr("passwordStrengthColor", 'red-text');
        this.attr("passwordStrengthGood", false);
      } else if (strongRegex.test(pass)) {
        this.attr("passwordStrengthText", i18n.strongPassword);
        this.attr("passwordStrengthColor", 'green-text');
        this.attr("passwordStrengthGood", true);
      } else if (mediumRegex.test(pass)) {
        this.attr("passwordStrengthText", i18n.okPassword);
        this.attr("passwordStrengthColor", 'black-text');
        this.attr("passwordStrengthGood", true);
      } else {
        this.attr("passwordStrengthText", i18n.weakPassword);
        this.attr("passwordStrengthColor", 'red-text');
        this.attr("passwordStrengthGood", false);
      }
    }

  },
  comparePasswordFunc: function(pass2) {

    if (pass2.length >= this.attr("passwordChange").length && pass2 != this.attr("passwordChange")) {
      this.attr("passwordMismatchError", true);
    } else {
      this.attr("passwordMismatchError", false);
    }

  }
});