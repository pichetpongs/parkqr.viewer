

function NS(ns, name, fn, root = globalThis) {
    ns = ns.split('.').filter(Boolean);
    if (!ns.length) return null;

    var el = root;
    ns.forEach(function (v, index) {
        el[v] = el[v] || {};
        el = el[v];
    });

    if (fn) el[name] = fn;

    return el[name];
}

var App = App || {};
var NAMESPACE, NAMECLASS;

//-----
NAMESPACE = 'App.Class.Module';
NAMECLASS = 'Base';
//-----

NS(NAMESPACE, NAMECLASS, (function() {
    var _super = args = Array.prototype.slice.call(arguments);
    //-----

    function Base(param) {
        _super.reverse().forEach(function (cls, index) { cls.apply(this, [param]) }, this);
        //-----
        let me = this;
        //-----
        if (param && param["app-version"]) Base.prototype.VERSION = param["app-version"];
        if (param && param["app-name"]) Base.prototype.APPNAME = param["app-name"];

    }
    //-----
    Base.prototype = {
        constructor: Base,
        //-----
        APP_NAME        : undefined,
        APP_VERSION     : undefined,
        //-----
        data: undefined,
        //-----
        component: {
            "body": "body"
        },
        //-----
        i18n: {
            get_text: function(code)  {
                if (code == "") return 0;
                //-----
                let lang = this[code] || this['th-TH'];
                let keys = code.split('.');
                let res;
                keys.forEach(function (n) {
                    if (!lang[n]) { return 0; }
                    if (lang[n].isObject()) { lang = lang[n]; return 0; }
                    //-----
                    res = lang[n];

                });

                return res;
            },
        },
        //-----
        init: function () {
            _super.reverse().forEach(function (cls, index) { if (cls.prototype["init"]) cls.prototype["init"].call(this); }, this);
            //-----
            var me = this;
            var cp = me.component;

            var init_component = function (cps) {
                var self = document;
                cps.forEach(function (val, key) {
                    if (val.isFunction()) return 0;
                    if (val.isObject()) { cps[key] = init_component(val); return 0; }
                    //-----
                    cps[key] = self.querySelectorAll(val);
                    if (cps[key].length == 1) cps[key] = cps[key][0];
                    if (key == "self") self = cps[key];
                });
                return cps;

            }

            init_component(me.component);
            
            return this;
        },
        render: function () {
            let me = this;
            let cp = me.component;
            //-----
            return this;
        },
        reset: function () {
            let me = this;
            //-----
            return {
                resetAll: function () {

                }
                
            };
        },
        //-----
        fetch_data: {

        }
    }

    return Base;

})());



/**
 * HISTORY
 * 
 * 20260618:1.0.0
 * - Inited : เริ่ม implement ให้เป็น base class รองรับการเพิ่ม client ในอนาคต
 * 
 */



