import can from 'can';
import 'can/map/define/';

import config from 'config';
import i18n from 'i18n-nls/main';
import restAPI from 'rest-api';

export default can.Map.extend({
  i18n: i18n,
  buttonRunning: null,
  inputDisabled: null,
  generalError: false,
  usernameOrEmail: '',
  securityQuestionAsked: false,
  securityAnswerDisabled: null,
  securityQuestionDynamic: '',
  securityAnswer: '',
  secondFactorAsked: false,
  secondFactor: '',
  secondFactorDisabled: null,
  runForgotPasswordFunc: function() {

    this.attr("buttonRunning", 'disabled');
    this.attr("inputDisabled", 'disabled');
    this.attr("passwordInputDisabled", 'disabled');

    if (this.attr("usernameOrEmail") != '') {

      var dataObj = {
        usernameOrEmail: this.attr("usernameOrEmail"),
        secondFactor: this.attr("secondFactor"),
        answer: this.attr("securityAnswer"),
        passwordForgot: restAPI.hashMe(this.attr("passwordForgot")),
        passwordRetypedForgot: restAPI.hashMe(this.attr("passwordRetypedForgot"))
      };

      var _self = this;
      restAPI.requestUnsigned('POST', '/api/forgot-password/', dataObj,
          function (res) {
            _self.attr("generalError", false);
            if (!_self.attr("secondFactorAsked") && typeof res.success.secondFactor != 'undefined' && res.success.secondFactor) {
              _self.attr("secondFactorAsked", true);
              _self.attr("buttonRunning", null);
            } else if (!_self.attr("securityQuestionAsked") && typeof res.success.question != 'undefined' && res.success.question != '') {
              _self.attr("secondFactorDisabled", 'disabled');
              _self.attr("securityQuestionAsked", true);
              _self.attr("securityQuestionDynamic", res.success.question);
              _self.attr("buttonRunning", null);
            } else if (!_self.attr("newPasswordAsked") && typeof res.success.askForNewPassword != 'undefined' && res.success.askForNewPassword) {
              _self.attr("securityAnswerDisabled", 'disabled');
              _self.attr("passwordInputDisabled", null);
              _self.attr("newPasswordAsked", true);
              _self.attr("buttonRunning", null);
            } else if (typeof res.success.flowDone != 'undefined' && res.success.flowDone) {
              _self.attr("generalError", true);
              _self.attr("buttonRunning", null);
              _self.attr("inputDisabled", null);

              //reset
              _self.attr("generalError", false);
              _self.attr("generalSuccess", true);
              _self.attr("newPasswordAsked", false);
              _self.attr("secondFactorDisabled", null);
              _self.attr("secondFactorAsked", false);
              _self.attr("secondFactor", '');
              _self.attr("usernameOrEmail", '');
              _self.attr("securityQuestionAsked", false);
              _self.attr("securityQuestionDynamic", '');
              _self.attr("securityAnswer", '');
              _self.attr("securityAnswerDisabled", null);
              _self.attr("passwordInputDisabled", null);

              $('#forgot-password-modal').modal('hide');
              $('#login-modal').modal('show');
            }
          },
          function (res) {
            console.log(res);
            _self.attr("generalError", true);
            _self.attr("buttonRunning", null);
            _self.attr("inputDisabled", null);

            //reset
            _self.attr("newPasswordAsked", false);
            _self.attr("secondFactorDisabled", null);
            _self.attr("secondFactorAsked", false);
            _self.attr("secondFactor", '');
            _self.attr("securityQuestionAsked", false);
            _self.attr("securityQuestionDynamic", '');
            _self.attr("securityAnswer", '');
            _self.attr("securityAnswerDisabled", null);
            _self.attr("passwordInputDisabled", null);
          });
    } else {
      this.attr("buttonRunning", null);
      this.attr("inputDisabled", null);
    }
    return false;

  },
  passwordInputDisabled: null,
  newPasswordAsked: false,
  passwordForgot: '',
  passwordRetypedForgot: '',
  passwordMismatchError: false,
  passwordStrengthGood: false,
  passwordStrengthText: '',
  passwordStrengthColor: 'red-text',
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

    if (pass2.length >= this.attr("passwordForgot").length && pass2 != this.attr("passwordForgot")) {
      this.attr("passwordMismatchError", true);
    } else {
      this.attr("passwordMismatchError", false);
    }

  }
});