import can from 'can';
import 'can/map/define/';

import config from 'config';
import i18n from 'i18n-nls/main';
import restAPI from 'rest-api';

export default can.Map.extend({
  isLoggedIn: null,
  i18n: i18n,
  buttonRunning: null,
  inputDisabled: null,
  secondFactorDisabled: null,
  loginErrorVisible: false,
  secondFactorVisible: false,
  userLogin: '',
  passwordLogin: '',
  secondFactorLogin: '',
  loginFunc: function() {
    this.attr("buttonRunning", 'disabled');
    this.attr("inputDisabled", 'disabled');
    this.attr("secondFactorDisabled", 'disabled');

    if (this.attr("userLogin") != '' && this.attr("passwordLogin") != '') {
      var _self = this;
      this.attr("loginErrorVisible", false);
      if (_self.attr("secondFactorVisible") && _self.attr("secondFactorLogin") != '') {
        restAPI.addSecondFactor(_self.attr("secondFactorLogin"));
        restAPI.request('GET', '/api/check-login/', {},
          function () {
            $('#login-modal').modal('hide');
            _self.attr("isLoggedIn", true);
            if ($('#checkbox_share_login').prop('checked')) restAPI.switchStoredDataLocally();

            // reset form
            _self.attr("secondFactorVisible", false);
            _self.attr("loginErrorVisible", false);
            _self.attr("userLogin", '');
            _self.attr("passwordLogin", '');
            _self.attr("secondFactorLogin", '');
            $('#checkbox_share_login').prop('checked', false);

            _self.attr("buttonRunning", null);
            _self.attr("inputDisabled", null);

          }, function () {
            _self.attr("loginErrorVisible", true);

            // reset form
            _self.attr("secondFactorVisible", false);
            _self.attr("secondFactorLogin", '');

            _self.attr("buttonRunning", null);
            _self.attr("inputDisabled", null);
            _self.attr("secondFactorDisabled", null);
          });
      } else if (!_self.attr("secondFactorVisible")) {
        restAPI.addAuthUser(this.attr("userLogin"));
        restAPI.passwordToSecret(this.attr("passwordLogin"));
        restAPI.request('POST', '/api/initiate/', {passwordHash: restAPI.getSecret()},
          function (res) {
            if (typeof res.secondFactor !== 'undefined' && res.secondFactor != '' && res.secondFactor) {
              _self.attr("secondFactorVisible", true);
              _self.attr("buttonRunning", null);
              _self.attr("secondFactorDisabled", null);
            } else {
              $('#login-modal').modal('hide');
              _self.attr("isLoggedIn", true);
              if ($('#checkbox_share_login').prop('checked')) restAPI.switchStoredDataLocally();

              // reset form
              _self.attr("secondFactorVisible", false);
              _self.attr("loginErrorVisible", false);
              _self.attr("userLogin", '');
              _self.attr("passwordLogin", '');
              _self.attr("secondFactorLogin", '');
              $('#checkbox_share_login').prop('checked', false);

              _self.attr("buttonRunning", null);
              _self.attr("inputDisabled", null);
            }

            _self.attr("loginErrorVisible", false);
          },
          function () {
            _self.attr("loginErrorVisible", true);

            _self.attr("buttonRunning", null);
            _self.attr("inputDisabled", null);
            _self.attr("secondFactorDisabled", null);
          });
      } else {
        this.attr("buttonRunning", null);
        this.attr("secondFactorDisabled", null);
      }
    } else {
      this.attr("buttonRunning", null);
      this.attr("inputDisabled", null);
      this.attr("secondFactorDisabled", null);
    }
    return false;

  }
});