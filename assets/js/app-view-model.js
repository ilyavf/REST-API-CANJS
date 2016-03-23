import can from 'can';
import 'can/map/define/';
import i18n from 'i18n-nls/main';
import restAPI from 'rest-api';
import config from 'config';

export default can.Map.extend({
    define: {
        isLoggedIn: {
            type: 'boolean',
            value: false,
            serialize: false
        },
        i18n: {
            value: i18n,
            serialize: false
        },
        languages: {
            value: config.languages
        },
        page: {
            type: 'string',
            value: ''
        }
    },
    start(){
        var self = this;

        restAPI.addDomain(config.server.domain);

        restAPI.request('GET', '/api/check-login/', {},
            function(){
                self.attr("isLoggedIn", true);
            },
            function(){
                self.attr("isLoggedIn", false);
                restAPI.logout();
            });
    },
    logoutFunc(){
        restAPI.logout();
        this.attr("isLoggedIn", false);
        return false;
    },
    switchLang(code) {
        localStorage.setItem('locale', code);
        location.reload();
        return false;
    }
});