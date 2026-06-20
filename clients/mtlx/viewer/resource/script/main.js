

NAMESPACE = 'App.Class.Module';
NAMECLASS = 'Main';
//-----
INSTANCE  = 'Main';

NS(NAMESPACE, NAMECLASS, (function(){
    var _super = args = Array.prototype.slice.call(arguments);
    //-----
    const APP_VERSION = "3.0.0";
    const CODE_CLIENT = "mtlx"; //กำหนดรหัสของ client

    //URL สำหรับดึงข้อมูล
    const URL_SERVICE = "https://script.google.com/macros/s/AKfycbyVtPa9o1sbeRkbBjiU4HNP98h9RvO8nsDRouD8l87Qz851en8isAlxSiyv7NvwwiHGBA/exec?channel=web";
    //-----
    const OPT_DIRECT    = 0;       // ค่ากำหนดให้ทำ server ส่งข้อมูลจาก json-file หรือ ตาราง
    const OPT_LOCATION  = 0;       //เก็บข้อมูล geo-location ส่งกลับ server
    const OPT_IPADDR    = 0;       //เก็บข้อมูล ip-address ส่งกลับ server
    const OPT_I18N_CODE = "th-TH"; //ค่าตั้งต้นรหัสภาษาแสดงผล

    //จำนวนเวลาที่ทำให้ค่าของ localstorage ของ passkey ยังคงใช้งานอยู่ได้
    const OPT_TIMEOUT_PASSKEY = 4 * 60 * 60 * 1000; 
    
    //ค่า timeout ของการ fetch ข้อมูล (ms)
    const TIMEOUT_FETCH = 12000;

    function Main(param = {}) {
        param = {
            ...param,
            "app-version"   : APP_VERSION,
            "code-client"   : CODE_CLIENT,
            "url-service"   : URL_SERVICE,
            "opt-direct"    : OPT_DIRECT,
            "opt-i18n-code" : OPT_I18N_CODE,
            "opt-location"  : OPT_LOCATION,
            "opt-ipaddr"    : OPT_IPADDR,
            //-----
            "opt-timeout-passkey": OPT_TIMEOUT_PASSKEY
        };
        //-----
        _super.reverse().forEach(function (cls, index) { cls.apply(this, [param]) }, this);
        //-----
        let me = this;
        //-----
        me.init().render().reset().resetAll();
    }
    //-----
    Main.prototype = {
        constructor: Main,
        //-----
        data: undefined,
        //-----
        component: {},
        //-----
        i18n: {
            "en-EN": {
                "title": "ParkQR Viewer - METROLUXE Kaset Condominium",
                "version": `ParkQR Viewer (version ${APP_VERSION})`,
                //-----
                "disclaimer": "METROLUXE Kaset Condominium<br>Juristic Person Office<br>39 Phahonyothin, Sena Nikhom Subdistrict,<br>Chatuchak District, Bangkok 10900",
                //-----
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
                "title": "ParkQR Viewer - อาคารชุดเมโทรสักซ์-เกษตร",
                "version": `ParkQR Viewer (เวอร์ชัน ${APP_VERSION})`,
                //-----
                "disclaimer": "นิติบุคคลอาคารชุดเมโทรลักซ์-เกษตร<br>39 ถนนประเสริฐมนูกิจ แขวงเสนานิคม เขตจตุจักร<br>กรุงเทพมหานคร 10900",
                //-----
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
            _super.reverse().forEach(function (cls, index) { if (cls.prototype["init"]) cls.prototype["init"].call(this); }, this);
            //-----
            //let me = this;
            //let cp = me.component;
            //-----
            return this;
        },
        render: function () {
            _super.reverse().forEach(function (cls, index) { if (cls.prototype["render"]) cls.prototype["render"].call(this); }, this);
            //-----
            let me = this;
            let cp = me.component;
            //-----
            return this;
        },
        reset: function () {
            _super.reverse().forEach(function (cls, index) { if (cls.prototype["reset"]) cls.prototype["reset"].call(this); }, this);
            //-----
            let me = this;
            //-----
            return {
                resetAll: function () {

                    let passkey = me.storage_passkey.get(".passkey");
                    //-----
                    passkey
                        ? me.fetch_data.private.call(me)
                        : me.fetch_data.public.call(me);   
                }
                
            };
        },
        //-----
        render_info: function (data, is_private=false) {
            _super.reverse().forEach(function (cls, index) { if (cls.prototype["render_info"]) cls.prototype["render_info"].call(this, data, is_private); }, this);
            //-----
        }
    }

    Main.extendFroms.apply(Main, arguments);

    return Main;

})(
    App.Class.Module.Viewer
));

NS("App.Module", INSTANCE, new (NS(NAMESPACE, NAMECLASS))());


/**
 * HISTORY
 * 
 * 20260620:3.0.0
 * - Inited : แยกไฟล์ออกมาเป็น child-class ของ metroluxe
 * 
 */



