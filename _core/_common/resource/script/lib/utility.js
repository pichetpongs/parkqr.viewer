

function LocalStorageTTL(prefix) {
    const now = () => Date.now();
    //----
    return {
        set: function (key, value, ttlMs = 0) {
            const rec = { value, expiresAt: ttlMs ? now() + ttlMs : null, savedAt: now(), v: 1, };
            //----
            localStorage.setItem(prefix + key, JSON.stringify(rec));
        },
        get: function (key) {
            const raw = localStorage.getItem(prefix + key);

            if (!raw) return null;

            try {
                const rec = JSON.parse(raw);
                if (rec.expiresAt && now() > rec.expiresAt) {  // หมดอายุแล้ว—ลบทิ้ง      
                    localStorage.removeItem(prefix + key);
                    return null;
                }

                return rec.value;

            } catch (e) {   // ข้อมูลพัง—เคลียร์ทิ้ง
                localStorage.removeItem(prefix + key);
                return null;
            }
        },
        remove: function (key) {
            localStorage.removeItem(prefix + key);
        },
        sweep: function () {

            for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i);
                //-----
                if (!k || !k.startsWith(prefix)) continue;

                try {
                    const rec = JSON.parse(localStorage.getItem(k));
                    //-----
                    if (rec && rec.expiresAt && now() > rec.expiresAt) { localStorage.removeItem(k); }

                } catch (e) {

                    localStorage.removeItem(k);
                }
            }
        }
    };
}