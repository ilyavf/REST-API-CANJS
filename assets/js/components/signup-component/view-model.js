import can from 'can';
import 'can/map/define/';

import config from 'config';
import i18n from 'i18n-nls/main';
import restAPI from 'rest-api';

export default can.Map.extend({
  i18n: i18n,
  buttonRunning: null,
  inputDisabled: null,
  secondFactorDisabled: null,
  generalError: false,
  userCreate: '',
  userCreateError: false,
  userCreateLengthError: false,
  userCreateAcceptedError: false,
  usernameCheckFunc: function() {
    // todo: accept only letters numbers underscore and hyphens

    if (this.attr("userCreate").length < 8 && this.attr("userCreate") != '') {
      this.attr("userCreateLengthError", true);
    } else if (this.attr("userCreate") != '') {
      this.attr("userCreateLengthError", false);

      var _self = this;
      if (this.attr('userCreate') != '') {
        restAPI.requestUnsigned('GET', '/api/check-username/' + this.attr('userCreate') + '/', {},
            function () {
              _self.attr('userCreateError', false);
            }, function () {
              _self.attr('userCreateError', true);
            });
      }
    }

  },
  emailCreate: '',
  emailCreateError: false,
  emailCreateInvalidError: false,
  emailCheckFunc: function() {

    if (this.attr("emailCreate") != '') {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if (re.test(this.attr("emailCreate")) && this.attr("emailCreate") != '') {
        this.attr("emailCreateInvalidError", false);
        var _self = this;
        if (this.attr('emailCreate') != '') {
          restAPI.requestUnsigned('GET', '/api/check-email/' + this.attr('emailCreate') + '/', {},
              function () {
                _self.attr('emailCreateError', false);
              }, function () {
                _self.attr('emailCreateError', true);
              });
        }
      } else {
        this.attr('emailCreateError', false);
        this.attr("emailCreateInvalidError", true);
      }
    } else {
      this.attr('emailCreateError', false);
      this.attr("emailCreateInvalidError", false);
    }

  },
  securityQuestionCreate: i18n.securityQuestion1,
  securityAnswerCreate: '',
  securityAnswerError: false,
  lengthAnswerFunc: function() {

    if (this.attr("securityAnswerCreate").length < 6 && this.attr("securityAnswerCreate") != '') {
      this.attr("securityAnswerError", true);
    } else {
      this.attr("securityAnswerError", false);
    }

  },
  passwordCreate: '',
  passwordRetypedCreate: '',
  passwordMismatchError: false,
  signUpFunc: function() {
    this.attr('generalError', false);
    this.attr("buttonRunning", 'disabled');
    this.attr("inputDisabled", 'disabled');
    this.attr("secondFactorDisabled", 'disabled');

    if (!this.attr("userCreateError")
        && !this.attr("userCreateLengthError")
        && !this.attr("emailCreateError")
        && !this.attr("emailCreateInvalidError")
        && !this.attr("securityAnswerError")
        && !this.attr("passwordMismatchError")
        && this.attr("passwordStrengthGood")
        && this.attr("userCreate") != ''
        && this.attr("emailCreate") != ''
        && this.attr("securityAnswerCreate") != ''
        && this.attr("passwordCreate") != ''
        && this.attr("passwordRetypedCreate") != '') {

      var dataObj = {
        user: this.attr("userCreate"),
        email: this.attr("emailCreate"),
        question: this.attr("securityQuestionCreate"),
        answer: this.attr("securityAnswerCreate"),
        pass: restAPI.hashMe(this.attr("passwordCreate")),
        retype: restAPI.hashMe(this.attr("passwordRetypedCreate")),
        factor: this.attr("secondFactorSignUp"),
        lang: localStorage.getItem('locale')
      };

      if (!this.attr("secondFactorVisible") || (this.attr("secondFactorVisible") && this.attr("secondFactorSignUp") != '')) {
        var _self = this;
        restAPI.requestUnsigned('POST', '/api/sign-up/', dataObj,
            function (res) {
              _self.attr('generalError', false);
              if (_self.attr("secondFactorVisible")) {
                $('#sign-up-modal').modal('hide');
                $('#login-modal').modal('show');
                _self.attr("buttonRunning", null);
                _self.attr("inputDisabled", null);

                // reset form
                _self.attr("generalError", false);
                _self.attr("userCreateError", false);
                _self.attr("userCreateLengthError", false);
                _self.attr("emailCreateError", false);
                _self.attr("emailCreateInvalidError", false);
                _self.attr("securityAnswerError", false);
                _self.attr("passwordMismatchError", false);
                _self.attr("passwordStrengthGood", false);
                _self.attr("secondFactorVisible", false);
                _self.attr("userCreate", '');
                _self.attr("emailCreate", '');
                _self.attr("securityAnswerCreate", '');
                _self.attr("passwordCreate", '');
                _self.attr("secondFactorLogin", '');
                _self.attr("passwordRetypedCreate", '');
                _self.attr("passwordStrengthText", '');
                _self.attr("secondFactorSignUp", '');
                _self.attr("passwordStrengthColor", 'red-text');

              } else if (typeof res.secondFactor !== 'undefined' && res.secondFactor != '' && res.secondFactor) {
                _self.attr("secondFactorVisible", true);
                _self.attr("buttonRunning", null);
                _self.attr("secondFactorDisabled", null);
              }
            }, function () {
              _self.attr('generalError', true);
              _self.attr("buttonRunning", null);
              _self.attr("inputDisabled", null);
              _self.attr("secondFactorDisabled", null);
            });
      } else {
        this.attr("buttonRunning", null);
      }
    } else if (this.attr("secondFactorVisible")) {
      this.attr("buttonRunning", null);
      this.attr("secondFactorDisabled", null);
    } else {
      this.attr("buttonRunning", null);
      this.attr("inputDisabled", null);
      this.attr("secondFactorDisabled", null);
    }

    return false;
  },
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

    if (pass2.length >= this.attr("passwordCreate").length && pass2 != this.attr("passwordCreate")) {
      this.attr("passwordMismatchError", true);
    } else {
      this.attr("passwordMismatchError", false);
    }

  },
  secondFactorSignUp: '',
  secondFactorVisible: false
});