

var App = App || {};
var NAMESPACE, NAMECLASS;

//-----
NAMESPACE = 'App.Class.Module';
NAMECLASS = 'Viewer';
//-----

NS(NAMESPACE, NAMECLASS, (function() {
    var _super = args = Array.prototype.slice.call(arguments);
    //-----
    const APP_NAME = "ParkQR Viewer";
     
    const API_ACTION = {
        "REGISTER" : "permit-regist",
        "DATA_PUBLIC" : "permit-public",
        "DATA_PRIVATE": "permit-private"
    }

    const STORE_PREFIX        = "app.viewer:";
    const STORE_VALUE_PASSKEY = ".passkey"
    const STORE_VALUE_PREF    = ".pref-lang";

    /**จำนวนเวลาที่เก็บค่า passkey หลังการใช้งาน */
    const TIMEOUT_PASSKEY = 4 * 60 * 60 * 1000;     
    const TIMEOUT_FETCH   = 12000;                //ค่า timeout ของการ fetch ข้อมูล (ms)
    
    const FMT_DATELONG = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    const FMT_DATESHORT = { year: 'numeric', month: 'short', day: 'numeric' };


    var APP_VERSION = undefined; //เลข version 
    var URL_SERVICE = undefined; //url สำหรับส่วนติดต่อ web-service
    var CODE_CLIENT = undefined; //รหัสของ client เพื่อส่งกลับไปยัง server
    //-----
    var OPT_DIRECT      = 0;        //ตัวกำหนดให้ server อ่านค่าจาก json (0) หรือจากตารางข้อมูล (1)
    var OPT_LOCATION    = 0;        //เก็บข้อมูล geo-location ส่งกลับ server
    var OPT_IPADDR      = 0;        //เก็บข้อมูล ip-address ส่งกลับ server
    var OPT_I18N_CODE   = "th-TH";  //รหัสภาษาแสดงผลตั้งต้น
    var OPT_URLKEY_CODE = "c";      //require parameter ของค่า qr-code
    //-----
    var OPT_TIMEOUT_PASSKEY = TIMEOUT_PASSKEY;
    //-----
    var PARAM_IPADDR     = ""; //เก็บข้อมูล ip-addr จากการดึงข้อมูล
    var PARAM_LOCATION   = ""; //เก็บข้อมูล position เครื่องที่ทำการแสกน
    var PARAM_PERMITCODE = ""; //เก็บข้อมูล qr-code จาก require-url


    function Viewer(param = {}) {
        param = { ...param, "app-name": APP_NAME };
        //-----
        _super.reverse().forEach(function (cls, index) { cls.apply(this, [param]) }, this);
        //-----
        let me = this;
        //-----
        if (param && param["app-version"]) APP_VERSION = param["app-version"];
        if (param && param["code-client"]) CODE_CLIENT = param["code-client"];
        if (param && param["url-service"]) URL_SERVICE = param["url-service"];
        if (param && param["opt-direct"]) OPT_DIRECT = param["opt-direct"];
        if (param && param["opt-i18n-code"]) OPT_I18N_CODE = param["opt-i18n-code"];
        if (param && param["opt-urlkey-code"]) OPT_URLKEY_CODE = param["opt-urlkey-code"];
        if (param && param["opt-location"]) OPT_LOCATION = param["opt-location"];
        if (param && param["opt-ipaddr"]) OPT_IPADDR = param["opt-ipaddr"];
        if (param && param["opt-timeout-passkey"]) OPT_TIMEOUT_PASSKEY = param["opt-timeout-passkey"];
        //-----

        //me.init().render().reset().resetAll();
    }

    //-----
    Viewer.prototype = {
        constructor: Viewer,
        //-----
        APP_NAME : APP_NAME,
        //-----
        storage_passkey: undefined,
        component: {
            "body": "body",
            "container": 'div#container',
            "switchLanguage": {
                self:  "label.sw-lang",
                input: "input#lang-toggle",
                knob:  ".sw-lang-knob .abbr",
            },
            "infoArea00": '#info-area00',
            "infoArea01": '#info-area01',
            "infoArea02": '#info-area02',
            "infoLost": '#info-lost',
            "infoNotFound": '#info-notfound',
            "caution": '.caution',
            "modalPin": {
                self: "#modal-passkey",
                btnSubmit: "button#btn-submit",
                btnCancel: "button#btn-cancel",
                input: "input",
            },
            "form": {
                self: '#frm-regist',
                label_no: "input#label-no",
                permit_qr: "input.permit-qr",
                vehicle_type: "select#vehicle-type",
                owner_unit: "input#owner-unit",
                owner_zone: "select#owner-zone",
                owner_name: "input#owner-name",
                owner_type: "select#owner-type",
                owner_phone: "input#owner-phone",
                //-----
                lp_province01: "select#lp-province-0",
                lp_no01: "input#lp-no-0",
                //-----
                submit: "button"
            }

        },
        //-----
        i18n: {
            "en-EN": {
                "title": "ParkQR Viewer - [CLIENT NAME]",
                "version": `ParkQR Viewer (version ${APP_VERSION})`,
                "header01": "Parking Permit Holder Information",
                "header02": "New registration",
                "header03": "Owner information",
                "header-vehicle01": "Vehicle #1",
                "header-vehicle02": "Vehicle #2",
                //----
                "permit-qr" : "QR Code",
                "label-no"  : "Sticker No.",
                "label-type": "Sticker type",
                "owner-zone": "Parking zone",
                "owner-unit": "Unit no.",
                "owner-name": "Owner’s name",
                "owner-phone": "Phone number",
                "datetime-regist": "Regist. date",
                "date-expire": "Expiry date",
                "vehicle-type": "Vehicle type",
                "lp-no": "License plate no.",
                "lp-province": "Registered province",
                "btn-detail": "View more information",
                "btn-regist": "Register",
                "btn-logout": "View baic information",
                "option": "-- Please select -- ",
                "option-province": "-- Please select province -- ",
                //-----
                modal: {
                    passkey: {
                        "topic": "View more information",
                        "title": "Please enter user's pin.",
                        "btn-submit": "Confrim",
                        "btn-cancel": "Cancel",
                    }
                },
                //-----
                "caution": "If you need to update or change parking permit information,<br>please contact the juristic person office.",
                "disclaimer": "[JURISTIC PERSON OFFICE ADDRESS]",
                "notice": "The parking sticker is the property of the condominium juristic person.It is issued solely for the purpose of identifying authorized users in accordance with the condominium’s regulations. The holder does not possess ownership rights over the sticker. Transfer, sale, or use for any other purpose is strictly prohibited.The juristic person reserves the right to revoke or withdraw the sticker immediately in the event that the holder’s rights are terminated or any regulations are violated.",
                "lost": {
                    "text": "This sticker has been reported lost.<br>Possession or use is prohibited.<br>Please return it to the Juristic Person Office immediately.",
                    "label-no": "Sticker no. : ",
                    "date-lost": "Lost date : "
                },
                subscript: {
                    "text": "Your subscription has expired.<br/>Please contact your service provider to renew."
                },
                "message": {
                    "data-operate": {
                        "ing": "<h1>... Retriving ...</h1>",
                        "access": "<h1>... Accessing ...</h1>",
                        "error": "... An error occurred ...",
                        "not-allow": "... unautherize/wrong passkey ...",
                        "regist": "... Registrating, please wait ...",
                        "regist-cmp": "... Registration complete ...",
                    },
                    "vehicle-notfound": "Registed vehicles are not found.<br/>Please contact the juristic office.",
                    "not-found": "Information from QR-Code is not found.<br />Please try again.",
                    "password": "Please enter the user's password."
                },
                "option-value": {
                    "vehicle-type": {
                        CAR: "Car",
                        BIKE: "Motorbike"
                    },
                    "owner-zone": {
                        BLD_A: "Building A",
                        BLD_B: "Building B",
                        BLD_C: "Building C",
                    }
                }
            },
            "th-TH": {
                "title": "ParkQR Viewer - [ชื่ออาคาร/สำนักงานนิติ]",
                "version": `ParkQR Viewer (เวอร์ชัน ${APP_VERSION})`,
                "header01": "ข้อมูลผู้ใช้สิทธิ์จอดยานพาหนะ",
                "header02": "ลงทะเบียนสติกเกอร์ใหม่",
                "header03": "ข้อมูลเจ้าของร่วม/ผู้เช่า/ผู้ใช้สิทธิ์",
                "header-vehicle01": "ยานพาหนะ #1",
                "header-vehicle02": "ยานพาหนะ #2",
                "permit-qr": "รหัสคิวอาร์",
                "label-no": "ลำดับสติกเกอร์",
                "label-type": "ประเภทสติกเกอร์",
                "owner-zone": "อาคาร/โซนจอด",
                "owner-unit": "เลขที่ห้องชุด",
                "owner-name": "ชื่อเจ้าของร่วม",
                "owner-phone": "หมายเลขโทรศัพท์",
                "datetime-regist": "วันที่ลงทะเบียน",
                "date-expire": "วันหมดอายุ",
                "vehicle-type": "ประเภทยานพาหนะ",
                "lp-no": "เลขทะเบียน",
                "lp-province": "จังหวัดจดทะเบียน",
                "btn-detail": "รายละเอียดผู้ใช้สิทธิ์ฯเพิ่มเติม",
                "btn-regist": "ลงทะเบียนสติกเกอร์",
                "btn-logout": "รายละเอียดผู้ใช้สิทธิ์ฯทั่วไป",
                "option": "-- โปรดระบุ -- ",
                "option-province": "-- โปรดระบุจังหวัด -- ",
                //-----
                modal: {
                    passkey: {
                        "topic": "รายละเอียดเพิ่มเติม",
                        "title": "กรุณากรอกรหัสผ่าน 5 หลัก",
                        "btn-submit": "ยืนยัน",
                        "btn-cancel": "ยกเลิก",
                    }
                },
                //-----
                "caution": "ต้องการแก้ไขข้อมูลผู้รับสิทธิ์/ข้อมูลยานพาหนะ<br>กรุณาติดต่อสำนักงานนิติบุคคล<br>ในวันและเวลาทำการ",
                "disclaimer": "[ที่อยู่สำนักงานนิติบุคคล]",
                "notice": "สติกเกอร์จอดรถเป็นทรัพย์สินของนิติบุคคลอาคารชุด ใช้เพื่อระบุตัวตนของผู้ได้รับสิทธิตามระเบียบนิติบุคคลเท่านั้น ผู้ครอบครองไม่มีสิทธิเป็นเจ้าของ ห้ามโอน ขาย หรือใช้ในวัตถุประสงค์อื่น นิติบุคคลขอสงวนสิทธิเรียกคืนหรือเพิกถอนการใช้ได้ทันที หากผู้ครอบครองสิ้นสิทธิหรือฝ่าฝืนข้อกำหนด",
                //-----
                "lost": {
                    "text": "สติกเกอร์นี้ถูกลงบันทึกประจำวันแล้วว่าสูญหาย <br />การครอบครองหรือนำไปใช้งานต่อ<br />จะถือว่าไม่ชอบด้วยระเบียบของนิติบุคคล <br /> หากพบเห็นกรุณานำส่งสำนักงานนิติบุคคลทันที",
                    "label-no": "สติกเกอร์หมายเลข : ",
                    "date-lost": "วันที่แจ้งหาย : "
                },
                subscript: {
                    "text": "ครบกำหนดวันอนุญาติใช้งานแล้ว<br/>หวังว่าระบบของเราได้อำนวยความสะดวกแก่ท่าน<br/>หากสนใจใช้งานต่อเนื่อง<br/>กรุณาติดต่อผู้ให้บริการ"
                },
                message: {
                    "data-operate": {
                        "ing": "<h1>... กำลังค้นหา ...</h1>",
                        "access": "<h1>... กำลังเข้าถึงข้อมูล ...</h1>",
                        "error": "... เกิดข้อผิดพลาดในการดึงข้อมูล ...",
                        "not-allow": "... ไม่อนุญาติให้เข้าถึง/รหัสผ่านไม่ถูกต้อง ...",
                        "regist": "... กำลังบันทึกรายการ โปรดรอ ...",
                        "regist1": '<svg><text x="50%" y="50%" dy=".35em" text- anchor="middle">...กำลังบันทึกรายการ โปรดรอ ... </text></svg> ',
                        "regist-inc": "... บันทึกรายการไม่สำเร็จ โปรดลองอีกครั้ง ...",
                        "regist-cmp": "... ลงทะเบียนสำเร็จ ..."
                    },
                    "vehicle-notfound": "ไม่พบข้อมูลยานพาหนะที่ลงทะเบียน<br>โปรดติดต่อสำนักงานนิติบุคคล",
                    "lost": "สติกเกอร์นี้ถูกลงบันทึกประจำวันแล้วว่าสูญหาย <br />การครอบครองหรือนำไปใช้งานต่อ<br />จะถือว่าไม่ชอบด้วยระเบียบของนิติบุคคล <br /> หากพบเห็นกรุณานำส่งสำนักงานนิติบุคคลทันที",
                    "not-found": "ไม่พบข้อมูลจากรหัสคิวอาร์โค้ดนี้<br />กรุณาตรวจสอบใหม่อีกครั้ง",
                    "password": "โปรดระบุรหัสผ่าน"
                },
                "option-value": {
                    "vehicle-type": {
                        CAR: "รถยนต์",
                        BIKE: "จักรยานยนต์"
                    },
                    "owner-zone": {
                        BLD_A: "อาคาร A",
                        BLD_B: "อาคาร B",
                        BLD_C: "อาคาร C",
                    }
                }
            }
        },
        //-----
        init: function () {
            _super.reverse().forEach(function (cls, index) { if (cls.prototype.init) cls.prototype.init.call(this); }, this);
            //-----
            var me = this;
            var cp = me.component;
            //-----
            me.storage_passkey = new LocalStorageTTL(STORE_PREFIX + CODE_CLIENT);

            true && (function (cps) {
                let curr_lang = localStorage.getItem(STORE_PREFIX + CODE_CLIENT + STORE_VALUE_PREF);

                curr_lang = curr_lang ? curr_lang : OPT_I18N_CODE;

                cps.input.addEventListener('change', function (e) {
                    let isChecked = e.target.checked;
                    //-----
                    cp.body.classList.forEach(cn => { cn.startsWith("lang-") ? cp.body.classList.remove(cn) : "" });

                    isChecked && (() => {
                        cp.body.classList.add("lang-en");
                        cps.input.checked = true;
                        cps.input.setAttribute('aria-checked', 'true');
                        cps.input.setAttribute('aria-label', 'Switch to Thai');
                        cps.knob.textContent = "EN";
                    })();
                    (!isChecked) && (() => {
                        cp.body.classList.add("lang-th");
                        cps.input.checked = false;
                        cps.input.setAttribute('aria-checked', 'false');
                        cps.input.setAttribute('aria-label', 'Switch to English');
                        cps.knob.textContent = "TH";
                    })();

                    localStorage.setItem(STORE_PREFIX + CODE_CLIENT + STORE_VALUE_PREF, isChecked ? 'en-EN' : 'th-TH');

                    cps.self.dispatchEvent(new Event("toggle"));

                });

                cps.input.checked = curr_lang == "en-EN";// ค่า check = en-EN
                cps.input.dispatchEvent(new Event('change'));

                cps.self.addEventListener("toggle", function (e) {
                    me.switch_language(localStorage.getItem(STORE_PREFIX + CODE_CLIENT + STORE_VALUE_PREF));
                });

                me.switch_language(curr_lang);

                return cps.self;
            })(me.component.switchLanguage);
            //-----
            true && this.render_skeleton();

            cp.body.addEventListener("onFetchData", function (e) { me.render_info(e.data); });

            //อ่านข้อมูลรหัสสติกเกอร์ จาก url
            PARAM_PERMITCODE = (new URLSearchParams(window.location.search)).get(OPT_URLKEY_CODE);

            return this;
        },
        render: async function () {
            _super.reverse().forEach(function (cls, index) { if (cls.prototype.render) cls.prototype.render.call(this); }, this);
            let me = this;
            let cp = me.component;
            //-----


            cp.modalPin.btnSubmit.addEventListener("click", function (e) {
                me.fetch_data.private.call(me);
            });
            cp.modalPin.btnCancel.addEventListener("click", function (e) {
                me.display_passkey(false);
            });
            cp.modalPin.input.forEach(function (el, idx) {
                el.addEventListener("input", function (e) {
                    e.target.value = e.target.value.replace(/\D/g, "");

                    if (e.target.value && idx < cp.modalPin.input.length - 1) {
                        cp.modalPin.input[idx + 1].focus();
                    }

                    let value = [...cp.modalPin.input].map(x => x.value).join("");
                    if (value.length == 5) { me.fetch_data.private.call(me);}

                });
                el.addEventListener("keydown", function (e) {
                    if (e.key === "Backspace" && !el.value && idx > 0) {
                        cp.modalPin.input[idx - 1].focus();
                    }   
                });
            });
            
            return this;
        },
        reset: async function () {
            _super.reverse().forEach(function (cls, index) { if (cls.prototype.reset) cls.prototype.reset.call(this); }, this);
            let me = this;

            return {
                resetAll: function () {

                }
                
            };
        },
        //-----
        switch_language: function (code) {
            OPT_I18N_CODE = code ? code : OPT_I18N_CODE;

            let me = this;
            //-----
            let dtLang = undefined;
            let elements = document.querySelectorAll("[data-lang]");
            let res = "";

            elements.forEach(el => {
                dtLang = me.i18n[OPT_I18N_CODE];
                let key = el.getAttribute('data-lang');
                //-----
                key = key.split('.');

                let res = "";
                key.forEach(function (k) {
                    if (k == "date") {
                        
                        value = el.getAttribute('data-value');
                        res = new Date(value).toLocaleDateString(OPT_I18N_CODE, FMT_DATELONG)
                        //-----
                        return 0;
                    }

                    if (!dtLang) return 0;
                    if (!dtLang[k]) return 0;
                    if (dtLang[k].isObject()) { dtLang = dtLang[k]; return 0; }

                    res = dtLang[k];
                });

                if (res != "") {el.innerHTML = res;}
            });
        },
        //-----
        display_error: function(msg = "",data_lang="") {
            let cp = this.component;

            msg != "" && (function () {
                cp.infoArea00.innerHTML = msg == "" ? "" : `<div class="error" data-lang="${data_lang}">${msg}</div>`;
                cp.container.classList.remove("loader");
                cp.container.classList.add("error");
            })();

            msg == "" && (function () {
                cp.infoArea00.innerHTML = "";
                cp.container.classList.remove("error");
            })();

            this.switch_language();
            
            //-----
            return cp;                            
        },
        display_notfound: function () {
            let me = this;
            let cp = me.component;
            //------
            this.display_error("");
            //------
            cp.infoArea01.innerHTML = "";
            cp.infoArea02.innerHTML = "";
            //-----
            cp.container.classList.add("not-found");
            cp.container.classList.remove("loader");
            cp.container.classList.add("ready");
            //-----
            this.switch_language();
        },
        display_lost: function (data) {
            let me = this;
            let cp = me.component;
            //-----
            cp.infoLost.innerHTML += ``;

            cp.infoLost.innerHTML = cp.infoLost.innerHTML + `
                <br><span data-lang="lost.label-no">สติกเกอร์หมายเลข</span>${data["label-no"]}
                <br><span data-lang="lost.date-lost">วันที่แจ้งหาย</span>${new Date(data["datetime-update"]).toLocaleDateString(OPT_I18N_CODE, FMT_DATESHORT)}`;
            me.display_error();
            //-----
            cp.infoArea01.innerHTML = "";
            cp.infoArea02.innerHTML = "";
            //-----
            cp.container.classList.add("lost");
            cp.container.classList.remove("loader");
            cp.container.classList.add("ready");
            
            this.switch_language();
        },
        display_unsubscription: function (data) {
            let me = this;
            let cp = me.component;
            //------
            this.display_error("");
            //-----
            cp.infoArea01.innerHTML = "";
            cp.infoArea02.innerHTML = "";
            //------
            cp.container.classList.add("unsubscription");
            cp.container.classList.remove("loader");
            cp.container.classList.add("ready");
            //-----
            this.switch_language();
        },
        display_unregistration: function (data) {
            let me = this;
            let cp = me.component;
            //------
            this.display_error("");
            //-----
            cp.infoArea01.innerHTML = "";
            cp.infoArea02.innerHTML = "";
            //------
            cp.container.classList.add("unregistration");
            cp.container.classList.remove("loader");
            cp.container.classList.add("ready");
            //-----
            this.switch_language();
        },
        display_passkey: function (isVisible) {
            let me = this;
            let cp = me.component;
            //------
            cp.modalPin.input.forEach(el => el.value = "");
            isVisible ? cp.container.classList.add("passkey") : cp.container.classList.remove("passkey");
            //-----
            cp.modalPin.input[0].focus();
            //-----
            this.switch_language();
        },
        //-----
        render_skeleton: function () {
            let me = this;
            let cp = me.component;

            cp.form.self.style.display = "none";
            cp.caution.style.display = "none";

            function render_item(caption = "", value = "", clang_key = "", vlang_key = "", itemClass = "", valueClass = '', item_type = undefined) {
                //-----                                        
                let display_value = value;
                //-----
                return `
                    <div class="item loading">
                        <div class="label" data-lang = "${clang_key}">${caption}</div>
                        <div class="value" style ="min-width:${(Math.random() * 20) + 30}%"></div>
                    </div>`;

            }

            cp.infoArea01.innerHTML = `
                <h1 data-lang="header01">ข้อมูลผู้ใช้สิทธิ์จอดยานพาหนะ</h1>
                ${render_item("ลำดับสติกเกอร์", "", "label-no")}
                ${render_item("ประเภท", "", "label-type")}
                ${render_item("วันลงทะเบียน", "", "datetime-regist")}
                ${render_item("วันหมดอายุ", "", "date-expire")}

                <button id="btn-detail" class="disabled loading">&nbsp;</button>
            `;

            cp.infoArea02.innerHTML = `
                <h2 data-lang = "header-vehicle01">ยานพาหนะ #1</h2>
                ${render_item("ประเภทยานพาหนะ", "", "label-no")}
                ${render_item("เลขทะเบียน", "", "label-type")}
                ${render_item("จังหวัดจดทะเบียน", "", "datetime-regist", "", "", "", "date")}
            `;

            this.switch_language();

        },
        render_info: function (data, is_private = false) {
            let me = this;
            let cp = me.component;
            //-----
            me.data = data;
            //-----

            cp.form.self.style.display = "none";
            cp.caution.style.display = "none";

            function render_item(caption = "", value = "", clang_key = "",vlang_key = "", itemClass = "", valueClass = '', item_type = undefined) {

                if (value == undefined || value == null) return "";
                if (value.toString().trim() == "") return "";
                //-----                                        
                let display_value = value;
                //-----
                if (item_type == "a") display_value = `<a href="tel:${value.replace(/\D/g, '')}">${value}</a>`;
                if (item_type == "date") {
                    const opt_date = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

                    display_value = `<span data-lang="date" data-value="${value}">${new Date(value).toLocaleDateString(OPT_I18N_CODE, FMT_DATELONG)}</span>`;
                }                       

                return `
                    <div class="item ${itemClass}">
                        <div class="label" data-lang = "${clang_key}">${caption}</div>
                        <div class="value ${valueClass}" data-lang = "${vlang_key}">${display_value}<div class="skeleton"></div></div>
                    </div>`;

            }

            let i18n = me.i18n;

            cp.infoArea01.innerHTML = `
                <h1 data-lang="header01">ข้อมูลผู้ใช้สิทธิ์จอดยานพาหนะ</h1>
                ${render_item("รหัสคิวอาร์"    , data["permit-qr"] , "permit-qr")}
                ${render_item("ลำดับสติกเกอร์", data["label-no"], "label-no")}

                ${render_item("ประเภท", i18n.get_text("option-value.vehicle-type." + data["vehicle-type"]),
                        "label-type", "option-value.vehicle-type."+ data["vehicle-type"])}

                ${render_item("อาคาร/โซนจอดฯ", i18n[OPT_I18N_CODE]["option-value"]["owner-zone"][data["owner-zone"]], "owner-zone")}

                ${render_item("เลขที่ห้องชุด", data["owner-unit"], "owner-unit")}
                ${render_item("ชื่อเจ้าของร่วมฯ", data["owner-name"], "owner-name")}
                ${render_item("หมายเลขโทรศัพท์", data["owner-phone"], "owner-phone", "","", "phone", "a")}

                ${data["is-regist"] && render_item("วันลงทะเบียน", data["datetime-regist"], "datetime-regist","","","","date")}
                ${data["is-regist"] && render_item("วันหมดอายุ", data["date-expire"], "date-expire","", "", "expired","date")}

                ${render_item("หมายเหตุ", data["remark"], "remark")}

                ${(is_private ? "" : `<button id="btn-detail" data-lang="btn-detail">รายละเอียดผู้ใช้สิทธิ์ฯเพิ่มเติม</button>`)}
            `;

            cp.infoArea02.innerHTML = "";

            var vItems = "";

            if (!data["vehicles"].length) vItems = '<h2 data-lang="message.vehicle-notfound">ไม่พบข้อมูลยานพาหนะที่ลงทะเบียน</h2>';

            data["vehicles"].forEach(function (r, idx) {
                vItems += `
                    <h2 data-lang = "header-vehicle0${idx + 1}">ยานพาหนะ #${idx + 1}</h2>
                    ${render_item(
                        "ประเภท"
                        , i18n.get_text("option-value.vehicle-type." + r["vehicle-type"])
                        , "vehicle-type"
                        , "option-value.vehicle-type." + (r["vehicle-type"])
                        ,  "vehicle-type-" + (r["vehicle-type"] == "BIKE" ? "bike" : "car") + (idx + 1)
                        )}
                    ${render_item("เลขทะเบียน", r["lp-no"], "lp-no")}
                    ${render_item("จังหวัดจดทะเบียน", r["lp-province"], "lp-province")}
                `;
            });

            if (is_private) { vItems += '<button id="btn-logout" data-lang="btn-logout">ออกจากระบบ</button>'; }

            cp.infoArea02.innerHTML = vItems;

            is_private && document
                .querySelector("button#btn-logout")
                .addEventListener("click", function (e) {
                    me.storage_passkey.remove(STORE_VALUE_PASSKEY);
                    me.fetch_data.public.call(me);
                });

            !is_private && document
                .querySelector("button#btn-detail")
                .addEventListener("click", function (e) {
                    me.display_passkey(true);
                });

            cp.caution.style.display = "block";

            this.display_error();

            cp.container.classList.remove("loader");
            cp.container.classList.add("ready");
            
        },
        render_form: function (data) {
            let me = this;
            let cp = me.component;

            cp.infoArea00.innerHTML = "";
            cp.infoArea01.innerHTML = "";
            cp.infoArea02.innerHTML = "";

            var cpf = cp.form;

            cpf.vehicle_type.addEventListener("change", function (e) {
                let value = this.value;
                let el = cp.form.self
                //-----
                el.classList.remove("vehicle-type-");
                el.classList.remove("vehicle-type-car");
                el.classList.remove("vehicle-type-bike");
                el.classList.add("vehicle-type-" + value.toLowerCase());
            });

            cpf.self.addEventListener('submit', async function (e) {
                e.preventDefault();
                //-----
                me.display_error(me.i18n.get_text("message.data-operate.regist"), "message.data-operate.regist")

                cp.form.label_no.disabled = false;
                cp.form.vehicle_type.disabled = false;
              
                const form = e.target;
                const formData = new FormData(form);
                //----
                let data = formData.entries(); // แปลง FormData เป็น Object

                for (let [key, val] of data) {
                    const match = key.match(/^vehicles\[(\d+)\]\[(.+)\]$/);
                    //-----
                    if (match) {
                        const index = parseInt(match[1], 10);
                        const field = match[2];
                        if (!data["vehicles"]) { data["vehicles"] = []; }
                        if (!data["vehicles"][index]) { data["vehicles"][index] = {}; }
                        data["vehicles"][index][field] = val;
                    } else {
                        data[key] = val;
                    }

                }

                me.fetch_data.regist.call(me,data);

            });

            cpf.label_no.value = data["label-no"] || '';
            //-----
            cpf.vehicle_type.value = data["vehicle-type"] || '';
            cpf.vehicle_type.dispatchEvent(new Event("change"));

            cpf.permit_qr.value = PARAM_PERMITCODE;
            //----
            cpf.owner_zone.value = data["owner-zone"] || '';
            cpf.owner_unit.value = data["owner-unit"] || '';
            cpf.owner_name.value = data["owner-name"] || '';
            cpf.owner_phone.value = data["owner-phone"] || '';

            //-----
            cpf.vehicle_type.required = true;
            cpf.label_no.required = true;
        
            let is_enable = data["label-no"] != "" && data["vehicle-type"] != "";

            cpf.label_no.disabled = is_enable;
            cpf.vehicle_type.disabled = is_enable;
            cpf.lp_no01.required = is_enable;
            cpf.lp_province01.required = is_enable;
            cpf.owner_unit.required = is_enable;
            cpf.owner_name.required = is_enable
            cpf.owner_phone.required = is_enable
            cpf.owner_zone.required = is_enable

            cpf.self.style.display = "block";
            cp.container.classList.remove("loader");
            cp.container.classList.add("ready");
        },
        //-----
        fetch_data: {
            ipaddr: async function () {

                const controller = new AbortController();
                const tid = setTimeout(() => controller.abort(), TIMEOUT_FETCH);

                try {
                    const response = await fetch("https://api.ipify.org?format=json", { signal: controller.signal});
                     //-----
                    clearTimeout(tid);
                    const res = await response.json();
                    //-----
                    return res["ip"] ? res["ip"] : undefined;

                } catch (e) {

                    clearTimeout(tid);

                    return "";
                }
            },
            public: async function () {

                console.log("Start loading :" + new Date());

                let me = this;
                let cp = me.component;

                if (cp.container.classList.contains("loader")) return 0;
                //-----
                cp.container.classList.remove("lost");
                cp.container.classList.remove("ready");
                cp.container.classList.add("loader");
                //-----
                me.render_skeleton();
                //-----
                window.scrollTo({ top: 0, behavior: 'smooth' });

                const controller = new AbortController();
                const tid = setTimeout(() => controller.abort(), TIMEOUT_FETCH);

                if (OPT_IPADDR) { PARAM_IPADDR = await this.fetch_data.ipaddr.call(me); }
                if (OPT_LOCATION) {
                    PARAM_LOCATION = await (function () {
                        return new Promise((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
                        })
                    }).call(me);
                }
              
                try {

                    const response = await fetch(`${URL_SERVICE}`, {
                        signal: controller.signal,
                        method: "POST",
                        headers: { "Content-Type": "text/plain" },
                        body: JSON.stringify({
                            "version-client": me.VERSION,
                            "code-client"   : CODE_CLIENT,
                            "action"        : API_ACTION.DATA_PUBLIC, 
                            "user-agent"    : navigator.userAgent,
                            "ip-addr"       : PARAM_IPADDR? PARAM_IPADDR: "",
                            "position": {
                                lat: PARAM_LOCATION.coords ? PARAM_LOCATION.coords.latitude : 0.00,
                                lng: PARAM_LOCATION.coords ? PARAM_LOCATION.coords.longitude:0.00,
                                acc: PARAM_LOCATION.coords ? PARAM_LOCATION.coords.accuracy:0.00
                            },
                            "opt-direct"    : OPT_DIRECT,
                            //-----
                            "permit-qr"     : PARAM_PERMITCODE
                        })
                    });

                   
                    clearTimeout(tid);
                    //-----
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);

                    me.display_error(); //clear message

                    const res = await response.json();

                    if (!res) { me.display_error(me.i18n.get_text("message.data-operate.error"), "message.data-operate.error"); return; }
                    //-----
                    if (res && res.status == "fail") { me.display_notfound();  return; }
                    if (res && res.status == "") { me.display_notfound(); return; }
                    //-----
                    if (res && res.config && !res.config["is-subscription"]) { me.display_unsubscription(res.data); return 0; }
                    if (res && res.config && !res.config["is-registration"]) { me.display_unregistration(res.data); return 0; }
                    //-----
                    if (!res.data) { me.display_notfound(); return; }
                    if (res.data["is-lost"]) { me.display_lost(res.data); return 0;}
                    if (!res.data["is-regist"]) { me.render_form(res.data); return 0; }

                    me.render_info(res.data);

                } catch (e) {

                    clearTimeout(tid);
                    console.log(e.message);

                    me.display_error(me.i18n.get_text("message.data-operate.error"), "message.data-operate.error");
                    cp.container.classList.remove("loader");

                    me.data?me.render_info(me.data):"";

                }

                console.log("Finish loading :" + new Date());
            },
            private: async function () {

                let me = this;
                let cp = me.component;
                //-----
                if (cp.container.classList.contains("loader")) return 0; //ยังคงโหลดข้อมูลให้ยกเลิก
                //-----
                let key = me.storage_passkey.get(STORE_VALUE_PASSKEY);  //อ่านข้อมุล pass-key จาก localstorage
                //-----
                key = key ? key : [...cp.modalPin.input].map(x => x.value).join("");
                if (key == "" || !key) return 0;   

                //-----
                me.display_passkey(false);
                me.display_error();
                //-----
                window.scrollTo({ top: 0, behavior: 'smooth' });
                //-----
                me.render_skeleton();

                cp.container.classList.remove("ready");
                cp.container.classList.add("loader");

                const controller = new AbortController();
                const tid = setTimeout(() => controller.abort(), TIMEOUT_FETCH);

                try {

                    const response = await fetch(`${URL_SERVICE}`, {
                        signal: controller.signal,
                        method: "POST",
                        headers: { "Content-Type": "text/plain" },
                        body: JSON.stringify({
                            "version-client": APP_VERSION,
                            "code-client"   : CODE_CLIENT,
                            "action"        : API_ACTION.DATA_PRIVATE,
                            "user-agent"    : navigator.userAgent,
                            "ip-addr"       : PARAM_IPADDR ? PARAM_IPADDR:"",
                            "position"      : {
                                lat: PARAM_LOCATION.coords ? PARAM_LOCATION.coords.latitude : 0.00,
                                lng: PARAM_LOCATION.coords ? PARAM_LOCATION.coords.longitude : 0.00,
                                acc: PARAM_LOCATION.coords ? PARAM_LOCATION.coords.accuracy : 0.00
                            },
                            "opt-direct"    : OPT_DIRECT,
                            //-----
                            "permit-qr"     : PARAM_PERMITCODE,
                            "user-key"      : key
                        })
                    });

                    clearTimeout(tid);
                    //-----
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);

                    me.display_error();

                    const res = await response.json();

                    if (!res) {
                        me.render_info(me.data);
                        me.display_error(me.i18n.get_text("message.data-operate.error"), "message.data-operate.error");
                        return;
                    }

                    if (res && res.status == "fail") {
                        me.render_info(me.data);
                        me.display_error(me.i18n.get_text("message.data-operate.not-allow"), "message.data-operate.not-allow");
                        return;
                    }

                    if (!res.data) {
                        me.display_notfound();
                        return;
                    }

                    if (!res.data["is-regist"]) {
                        me.render_form(res.data);
                        return 0;
                    }

                    if (res.data["is-lost"]) {
                        me.display_lost(res.data);
                        return 0;
                    }


                    me.render_info(res.data, true);

                    !me.storage_passkey.get(STORE_VALUE_PASSKEY)
                        && me.storage_passkey.set(STORE_VALUE_PASSKEY, key, OPT_TIMEOUT_PASSKEY);


                } catch (e) {
                    clearTimeout(tid);
                    //----
                    console.log(e.message);
                    //----
                    this.display_error(me.i18n.get_text("message.data-operate.error"));
                    //----
                    me.render_info(me.data, true);
                }

            },
            /**
             * API:สำหรับการกรอกข้อมูลเพิ่มลงทะเบียนสติกเกอร์
             * @param {any} data
             * @returns
             */
            regist: async function(data) {
                let me = this;
                let cp = me.component;

                try {

                    me.display_error(me.i18n.get_text("message.data-operate.regist1"), "message.data-operate.regist1");
                    //-----
                    cp.container.classList.add("loader");
                    //-----
                    window.scrollTo({ top: 0, behavior: 'smooth' });

                    PARAM_IPADDR = PARAM_IPADDR != "" ? PARAM_IPADDR : await me.fetch_data.ipaddr.call(me);

                    data["version-client"]  = me.APP_VERSION;
                    data["code-client"]     = CODE_CLIENT;
                    data["action"]          = API_ACTION.REGISTER
                    data["user-agent"]      = navigator.userAgent
                    data["ip-addr"]         = PARAM_IPADDR
                    data["permit-qr"]       = PARAM_PERMITCODE

                    const response = await fetch(`${URL_SERVICE}`, {
                        method: 'POST',
                        headers: { "Content-Type": "text/plain" },
                        body: JSON.stringify(data)
                    });

                    const res = await response.json();

                    if (res && res.status == "fail") {
                        me.display_error(me.i18n.get_text("message.data-operate.regist-inc"), "message.data-operate.regist-inc");
                    }
                    if (res && res.status == "not-found") { me.display_error(`...${res.message}...`); return;}
                    if (res && res.status == "conflict")  { me.display_error(`...${res.message}...`); return; }

                    me.display_error(me.i18n.get_text("message.data-operate.regist-cmp"), "message.data-operate.regist-cmp");

                    res.data["is-regist"]
                        ? me.render_info(res.data, true)
                        : me.render_form(res.data);

                    cp.container.classList.remove("loader");

                } catch (e) {
                    console.log(e.message);
                    //-----
                    cp.container.classList.remove("loader");
                    me.display_error(me.i18n.get_text("message.data-operate.regist-inc"), "message.data-operate.regist-inc");
                }
            }
        }
    }

    Viewer.extendFroms.apply(Viewer, arguments);

    return Viewer;

})(
    App.Class.Module.Base   
));



/**
 * HISTORY
 * 
 * 20260619:3.0.0
 * - Moded : แก้ไขโครงสร้าง code ให้รองรับการ inheritance ให้สามารถใช้ code ซ้ำกับ client อื่นๆได้
 * - Added : เพิ่มปุ่ม logout ให้สามารถออกจากการแสดงข้อมูลแบบ private 
 * 
 * 20260615:2.2.0
 * - Added : เพิ่มการแสดงผลเมื่อไม่ต่ออายุการใช้งาน
 * - Added : เพิ่มการแสดงผลเมื่อสติกเกอร์ที่ยังไมได้ลงทะเบียนหมดอายุ
 * - Added : เปลี่ยนการแสดงผลการโหลดข้อมูลเป็น skeleton-loader
 * - Added : เปลี่ยนการแสดงผลคำสั้่ง prompt เพื่อขอรหัสผ่านเป็นการใช้ css-modal แทน
 * 
 * 20260608:2.1.0
 * - Added : เพิ่มการเก็บค่า Geo-Location จากผู้แสกนเพื่อระบุตำแหน่ง
 * 
 * 20260304:2.0.7
 * - Fixed : กำหนดค่า content-type ของ fetch() เป็น "plain-text" ให้ตรงกับ appscript เพื่อให้เงิอนไขตรงกันผ่านไปยัง json.parse()
 * 
 * 20251114:2.0.4
 * - Moded : แก้ไขเวลาของ localstorage:key เป็น 4 ชั่วโมง
 * 
 * 20251112:2.0.3
 * - Added : เพิ้มการส่งค่า version-client กลับไปยัง server เพื่อบันทึกข้อมูล
 * - Fixed : แก้ไขข้อความแสดงผล "รหั่สผ่านไม่ถูกต้อง"
 * 
 * 20251107:2.0.2
 * - Fixed : แก่้ไขการแสดงข้อมูล เมื่อป้อนข้อมูลลงทะเบียนแค่เลขที่และประเภทสติกเกอร์ ให้กลับมาแสดง form ใหม่อีกครั้ง
 * 
 * 20251105:2.0.1
 * - Added : เพิ่มการส่งข้อมูลรหัสของนิติบุคคล (code-client) เพื่อรองรับการรวมตารางในอนาคต กรณีใช้ api เดียวกัน 
 * - Fixed : เพิ่มการรวม code-client กับ STORE_PREFIX ใน localstorage รองรับการใช้งานหลาย client และ การป้อน pass-key เดียวกันในแต่ละ client
 * 
 * 20251103:2.0.0
 * - Moded : เปลี่ยนโครงสร้างโค็ดเดิม เป็นแบบ namespace-class-object 
 * - Added : เพิ่มการแสดงผลแบบสองภาษา เก็บการตั้งค่าภาษาที่เลือกครั้งแรกไว้ใน localstorage
 * - Moded : เปลี่ยน UI ส่วนของสี แยกเป็นตัวแปรใน SCSS ง่ายต่อการแก้ไขในอนาคต 
 * - Moded : เพิ่มฟังก์ชันการนับ timeout สำหรับการ fetch ข้อมูลทุก API
 * 
 * 
 */



