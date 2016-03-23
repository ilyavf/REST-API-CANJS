(function (root, factory) {
  if(typeof define === "function" && define.amd) {
    define(["jquery", "cryptojs.core", "cryptojs.x64", "cryptojs.sha512", "cryptojs.hmac", "cryptojs.base64", "cryptojs.pbkdf2"], function($, CryptoJS){
      return (root.myModule = factory($, CryptoJS));
    });
  } else if(typeof module === "object" && module.exports) {
    module.exports = (root.myModule = factory(require("jquery", "cryptojs.core", "cryptojs.x64", "cryptojs.sha512", "cryptojs.hmac", "cryptojs.base64", "cryptojs.pbkdf2")));
  } else {
    root.myModule = factory(root.jQuery);
  }
}(this, function($, CryptoJS) {
  'use strict';

  var domain = '', authUser = '', authSecret = '';
  var storeDataWith = sessionStorage;

  domain = (storeDataWith.getItem('domain') ? storeDataWith.getItem('domain') : '' );
  authUser = (storeDataWith.getItem('authUser') ? storeDataWith.getItem('authUser') : '');
  authSecret = (storeDataWith.getItem('authSecret') ? storeDataWith.getItem('authSecret') : '');

  return {
    logout: function () {
      authUser = '';
      authSecret = '';
      sessionStorage.removeItem('authUser');
      sessionStorage.removeItem('authSecret');
      localStorage.removeItem('authUser');
      localStorage.removeItem('authSecret');
    },
    addAuthUser: function (newAuthUser) {
      authUser = newAuthUser;
      storeDataWith.setItem('authUser', authUser);
    },
    switchStoredDataLocally: function () {
      storeDataWith = localStorage;

      storeDataWith.setItem('domain', domain);
      storeDataWith.setItem('authUser', authUser);
      storeDataWith.setItem('authSecret', authSecret);
    },
    switchStoredDataSession: function () {
      storeDataWith = sessionStorage;

      storeDataWith.setItem('domain', domain);
      storeDataWith.setItem('authUser', authUser);
      storeDataWith.setItem('authSecret', authSecret);
      localStorage.removeItem('authUser');
      localStorage.removeItem('authSecret');
    },
    hashMe: function(toHash) {
      return CryptoJS.SHA512(toHash).toString();
    },
    addDomain: function (newDomain) {
      domain = newDomain;
      storeDataWith.setItem('domain', newDomain);
    },
    addSecret: function(newAuthSecret) {
      authSecret = newAuthSecret;
      storeDataWith.setItem('authSecret', newAuthSecret);
    },
    getSecret: function() {
      return authSecret;
    },
    passwordToSecret: function(password) {
      authSecret = this.hashMe(password);
      storeDataWith.setItem('authSecret', authSecret);
    },
    sign: function(type, endPoint, orderedParams, timestamp) {
      var toSign = type + endPoint + orderedParams + timestamp;
      var hash = CryptoJS.HmacSHA512(toSign, authSecret);
      return CryptoJS.enc.Base64.stringify(hash);
    },
    addSecondFactor: function(secondFactor) {
      var hash = CryptoJS.HmacSHA512(authSecret, secondFactor);
      authSecret = CryptoJS.enc.Base64.stringify(hash);
      storeDataWith.setItem('authSecret', authSecret);
    },
    request: function(type, endPoint, paramObj, successFunc, errorFunc) {
      var _self = this;
      if (domain == '' || authUser == '' || authSecret == '') {
        errorFunc();
        return;
      }
      endPoint = domain + endPoint;
      var orderedParamObj = {};
      if (typeof paramObj !== 'undefined') {
        Object.keys(paramObj)
          .sort()
          .forEach(function (v) {
            orderedParamObj[v] = paramObj[v];
          });
      } else paramObj = {};
      var params = this.obj2Params(orderedParamObj);
      var timestamp = Math.round(new Date().getTime() / 1000);
      var signature = this.sign(type, endPoint, params, timestamp);

      $.ajax({
        url: endPoint,
        data: orderedParamObj,
        headers: {
          "Auth-Timestamp": timestamp,
          "Auth-User": authUser,
          "Auth-Signature": signature,
          "X-Requested-With": "XMLHttpRequest"
        },
        type: type.toUpperCase(),
        success: function(res, status, xhr) {
          var challenge = xhr.getResponseHeader('Auth-Challenge');
          var salt = xhr.getResponseHeader('Auth-Salt');
          if (typeof challenge !== 'undefined' && challenge != '' && challenge && typeof salt !== 'undefined' && salt != '' && salt) {
            _self.addSecret(CryptoJS.PBKDF2(authSecret, salt, {iterations: 1000, hasher: CryptoJS.algo.SHA512, keySize: 256 / 16}).toString());
            _self.request('POST', endPoint.replace(domain, ""), {challenge: challenge}, successFunc, errorFunc);
          } else {
            var newSecret = xhr.getResponseHeader('Auth-Secret');
            if (typeof newSecret !== 'undefined' && newSecret != '' && newSecret) _self.addSecret(newSecret);

            var secondFactor = xhr.getResponseHeader('Auth-Second-Factor');
            if (typeof secondFactor !== 'undefined' && secondFactor != '' && secondFactor) {
              res.secondFactor = true;
            }

            successFunc(res);
          }
        },
        error: errorFunc
      });
    },
    requestUnsigned: function(type, endPoint, paramObj, successFunc, errorFunc) {
      if (domain == '') {
        errorFunc();
        return;
      }
      endPoint = domain + endPoint;
      $.ajax({
        url: endPoint,
        data: paramObj,
        headers: {
          "X-Requested-With": "XMLHttpRequest"
        },
        type: type.toUpperCase(),
        success: function(res, status, xhr) {
          var secondFactor = xhr.getResponseHeader('Auth-Second-Factor');
          if (typeof secondFactor !== 'undefined' && secondFactor != '' && secondFactor) {
            res.secondFactor = true;
          }

          successFunc(res);
        },
        error: errorFunc
      });
    },
    obj2Params: function(obj) {
      var str = "";
      for (var key in obj) {
        if (str != "") str += "&";
        str += key + "=" + obj[key];
      }
      return str;
    }
  };
}));