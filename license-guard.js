/**
 * ============================================================================
 * License Guard System (Aldragat System - نظام الترخيص والتفعيل والتمديد PWA)
 * المفتاح السري: ALTHAWWAB_ALDRAGAT_2026_PRO
 * متوافق 100% مع مولّد التفعيل الدائم ومولّد التمديد الشامل
 * يعمل بكفاءة تامة على الويب والأجهزة الذكية (iOS, iPadOS, Android, PC) بدون إنترنت
 * ============================================================================
 */

(function () {
  'use strict';

  // 1. الثوابت وإعدادات التشفير
  const PROGRAM_SALT = "ALTHAWWAB_ALDRAGAT_2026_PRO";
  const TRIAL_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 أيام
  const EXTENSION_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 أيام للتمديد
  const WHATSAPP_PHONE = '0538783381';
  const OVERLAY_ID = 'licenseGuardModalOverlay';

  // خوارزمية SHA-256 نقية مدمجة بالكامل تعمل دون أي اعتماد خارجي (Pure JS)
  function sha256Hex(ascii) {
    function rightRotate(value, amount) {
      return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    const lengthProperty = 'length';
    let i, j, result = '';
    const words = [];
    const asciiBitLength = ascii[lengthProperty] * 8;

    let hash = [];
    const k = [];
    let primeCounter = 0;
    const isComposite = {};
    for (let candidate = 2; primeCounter < 64; candidate++) {
      if (!isComposite[candidate]) {
        for (i = 0; i < 313; i += candidate) {
          isComposite[i] = candidate;
        }
        hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
        k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
      }
    }

    ascii += '\x80';
    while ((ascii[lengthProperty] % 64) - 56) ascii += '\x00';
    for (i = 0; i < ascii[lengthProperty]; i++) {
      j = ascii.charCodeAt(i);
      if (j >> 8) return ''; // non-ascii
      words[i >> 2] |= j << ((3 - (i % 4)) * 8);
    }
    words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
    words[words[lengthProperty]] = asciiBitLength;

    for (j = 0; j < words[lengthProperty]; ) {
      const w = words.slice(j, (j += 16));
      const oldHash = hash;
      hash = hash.slice(0, 8);
      for (i = 0; i < 64; i++) {
        const w15 = w[i - 15],
          w2 = w[i - 2],
          a = hash[0],
          e = hash[4];
        const temp1 =
          hash[7] +
          (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
          ((e & hash[5]) ^ (~e & hash[6])) +
          k[i] +
          (w[i] =
            i < 16
              ? w[i]
              : (w[i - 16] +
                  (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                  w[i - 7] +
                  (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
                0);
        const temp2 =
          (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
          ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

        hash = [(temp1 + temp2) | 0].concat(hash);
        hash[4] = (hash[4] + temp1) | 0;
      }
      for (i = 0; i < 8; i++) {
        hash[i] = (hash[i] + oldHash[i]) | 0;
      }
    }

    for (i = 0; i < 8; i++) {
      for (j = 3; j + 1; j--) {
        const b = (hash[i] >> (j * 8)) & 255;
        result += ((b < 16) ? '0' : '') + b.toString(16);
      }
    }
    return result.toUpperCase();
  }

  // 2. إدارة وتوليد معرّف الجهاز (Device ID) المتوافق
  // التنسيق المعتمد في المنظومة: SCH-XXXX-YYYY (أحرف إنجليزية كبيرة وأرقام فقط بطول 13 خانة)
  function generateRandomDeviceId() {
    const chars = '0123456789ABCDEF';
    let p1 = '', p2 = '';
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = new Uint8Array(8);
      crypto.getRandomValues(bytes);
      for (let i = 0; i < 4; i++) p1 += chars[bytes[i] % 16];
      for (let i = 4; i < 8; i++) p2 += chars[bytes[i] % 16];
    } else {
      for (let i = 0; i < 4; i++) p1 += chars[Math.floor(Math.random() * 16)];
      for (let i = 0; i < 4; i++) p2 += chars[Math.floor(Math.random() * 16)];
    }
    return `SCH-${p1}-${p2}`;
  }

  // محاولة قراءة المعرف من التخزين المحلي فوراً
  let currentDeviceId = '';
  try {
    currentDeviceId = localStorage.getItem('pwa_device_id') ||
                      localStorage.getItem('aldragat_dev_id') ||
                      '';
  } catch (e) {}

  // إذا كان متاحاً من نافذة Electron مسبقاً نستخدمه
  if (!currentDeviceId && typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.getDeviceId === 'function') {
    try {
      const dev = window.electronAPI.getDeviceId();
      if (dev && typeof dev === 'string') currentDeviceId = dev.trim().toUpperCase();
    } catch (e) {}
  }

  // إذا لم يوجد، نولّد معرّفاً ثابتاً بالتنسيق المطلوب ونحفظه فوراً في localStorage
  if (!currentDeviceId) {
    currentDeviceId = generateRandomDeviceId();
  }

  try {
    localStorage.setItem('pwa_device_id', currentDeviceId);
    localStorage.setItem('aldragat_dev_id', currentDeviceId);
  } catch (e) {}

  // 3. التخزين المتين في IndexedDB (قاعدة AldragatDB / مستودع systemStore)
  let cachedIdbState = null;

  function initIDB() {
    return new Promise(function(resolve) {
      if (typeof window === 'undefined' || !window.indexedDB) return resolve(null);
      try {
        var req = window.indexedDB.open('AldragatDB', 1);
        req.onupgradeneeded = function(e) {
          var db = e.target.result;
          if (!db.objectStoreNames.contains('systemStore')) {
            db.createObjectStore('systemStore');
          }
        };
        req.onsuccess = function(e) { resolve(e.target.result); };
        req.onerror = function() { resolve(null); };
      } catch (err) {
        resolve(null);
      }
    });
  }

  async function getFromIndexedDB() {
    try {
      var db = await initIDB();
      if (!db) return null;
      return new Promise(function(resolve) {
        try {
          var tx = db.transaction('systemStore', 'readonly');
          var store = tx.objectStore('systemStore');
          var req = store.get('licenseState');
          req.onsuccess = function() {
            cachedIdbState = req.result || null;
            if (cachedIdbState && cachedIdbState.deviceId) {
              currentDeviceId = cachedIdbState.deviceId;
              try {
                localStorage.setItem('pwa_device_id', currentDeviceId);
                localStorage.setItem('aldragat_dev_id', currentDeviceId);
              } catch (e) {}
            }
            resolve(cachedIdbState);
          };
          req.onerror = function() { resolve(null); };
        } catch (e) {
          resolve(null);
        }
      });
    } catch (e) {
      return null;
    }
  }

  async function saveToIndexedDB(data) {
    try {
      var db = await initIDB();
      if (!db) return;
      var existing = (await getFromIndexedDB()) || {};
      var merged = Object.assign({}, existing, data, { deviceId: currentDeviceId });
      cachedIdbState = merged;
      return new Promise(function(resolve) {
        try {
          var tx = db.transaction('systemStore', 'readwrite');
          var store = tx.objectStore('systemStore');
          var req = store.put(merged, 'licenseState');
          req.onsuccess = function() { resolve(); };
          req.onerror = function() { resolve(); };
        } catch (e) {
          resolve();
        }
      });
    } catch (e) {}
  }

  // 4. معادلة التحقق من كود التفعيل الدائم (10 خانات أحرف إنجليزية كبيرة وأرقام)
  function calculateCorrectCode(deviceId) {
    try {
      return sha256Hex(deviceId + PROGRAM_SALT).substring(0, 10).toUpperCase();
    } catch (e) {
      console.error('[LicenseGuard] Error hashing activation code:', e);
      return '';
    }
  }

  function isValidActivationCode(code) {
    if (!code || typeof code !== 'string') return false;
    const clean = code.trim().toUpperCase();
    const correct = calculateCorrectCode(currentDeviceId);
    return clean === correct;
  }

  // 5. معادلة التحقق من كود التمديد (5 أيام إضافية - EXT5-XXXXXXXX)
  function calculateExtensionCode(deviceId) {
    try {
      const hash = sha256Hex(deviceId + PROGRAM_SALT + '_EXT5').toUpperCase();
      return 'EXT5-' + hash.substring(0, 8);
    } catch (e) {
      console.error('[LicenseGuard] Error hashing extension code:', e);
      return '';
    }
  }

  function getUsedExtCodes() {
    try {
      const raw = localStorage.getItem('aldragat_used_ext_codes');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function saveUsedExtCode(code) {
    try {
      const list = getUsedExtCodes();
      if (!list.includes(code)) {
        list.push(code);
        localStorage.setItem('aldragat_used_ext_codes', JSON.stringify(list));
      }
      saveToIndexedDB({ used_ext_codes: list });
    } catch (e) {}
  }

  // 6. التخزين في localStorage
  function readLocalStorageState() {
    try {
      const firstRun = localStorage.getItem('aldragat_first_run');
      const lastSeen = localStorage.getItem('aldragat_last_seen');
      const trialEnd = localStorage.getItem('aldragat_trial_end');
      const activated = localStorage.getItem('aldragat_activated') === 'true';
      const key = localStorage.getItem('aldragat_license_key') || '';
      return {
        aldragat_first_run: firstRun ? parseInt(firstRun, 10) : null,
        aldragat_last_seen: lastSeen ? parseInt(lastSeen, 10) : null,
        aldragat_trial_end: trialEnd ? parseInt(trialEnd, 10) : null,
        aldragat_activated: activated,
        aldragat_license_key: key
      };
    } catch (e) {
      return null;
    }
  }

  function writeLocalStorageState(state) {
    try {
      if (state.aldragat_first_run !== null && state.aldragat_first_run !== undefined) {
        localStorage.setItem('aldragat_first_run', String(state.aldragat_first_run));
      }
      if (state.aldragat_last_seen !== null && state.aldragat_last_seen !== undefined) {
        localStorage.setItem('aldragat_last_seen', String(state.aldragat_last_seen));
      }
      if (state.aldragat_trial_end !== null && state.aldragat_trial_end !== undefined) {
        localStorage.setItem('aldragat_trial_end', String(state.aldragat_trial_end));
      }
      localStorage.setItem('aldragat_activated', state.aldragat_activated ? 'true' : 'false');
      if (state.aldragat_license_key) {
        localStorage.setItem('aldragat_license_key', state.aldragat_license_key);
      }
      localStorage.setItem('pwa_device_id', currentDeviceId);
      localStorage.setItem('aldragat_dev_id', currentDeviceId);
    } catch (e) {}
  }

  // 7. حساب تاريخ انتهاء التجربة بدقة
  function resolveCurrentExpiry(local, idb, now) {
    local = local || {};
    idb = idb || {};
    const savedEnd = Math.max(
      local.aldragat_trial_end || 0,
      idb.aldragat_trial_end || 0
    );
    if (savedEnd && !isNaN(savedEnd) && savedEnd > 0) {
      return savedEnd;
    }
    const runs = [local.aldragat_first_run, idb.aldragat_first_run].filter(x => x && !isNaN(x) && x > 0);
    const firstRun = runs.length > 0 ? Math.min(...runs) : now;
    return firstRun + TRIAL_DURATION_MS;
  }

  // 8. محرك تقييم حالة الترخيص ومكافحة التلاعب بالوقت
  function evaluateLicenseState() {
    const local = readLocalStorageState() || {};
    const idb = cachedIdbState || {};

    // 1) فحص التفعيل الدائم مدى الحياة
    const isLocalActivated = local.aldragat_activated === true && isValidActivationCode(local.aldragat_license_key);
    const isIdbActivated = idb.aldragat_activated === true && isValidActivationCode(idb.aldragat_license_key);

    if (isLocalActivated || isIdbActivated) {
      const validKey = (isLocalActivated ? local.aldragat_license_key : '') || idb.aldragat_license_key;
      const syncedState = {
        deviceId: currentDeviceId,
        aldragat_first_run: local.aldragat_first_run || idb.aldragat_first_run || Date.now(),
        aldragat_trial_end: local.aldragat_trial_end || idb.aldragat_trial_end || (Date.now() + 3153600000000),
        aldragat_last_seen: Date.now(),
        aldragat_activated: true,
        aldragat_license_key: validKey
      };
      writeLocalStorageState(syncedState);
      saveToIndexedDB(syncedState);
      return {
        status: 'ACTIVATED',
        isActivated: true,
        isLocked: false,
        daysRemaining: 0,
        deviceId: currentDeviceId
      };
    }

    // 2) معالجة بداية التجربة، آخر ظهور، وموعد الانتهاء
    const now = Date.now();
    const runs = [local.aldragat_first_run, idb.aldragat_first_run].filter(x => x && !isNaN(x) && x > 0);
    const firstRun = runs.length > 0 ? Math.min(...runs) : now;

    const seens = [local.aldragat_last_seen, idb.aldragat_last_seen].filter(x => x && !isNaN(x) && x > 0);
    const lastSeen = seens.length > 0 ? Math.max(...seens) : now;

    const trialEnd = resolveCurrentExpiry(local, idb, now);

    // التحقق من التلاعب بساعة النظام إلى الوراء
    if (now < lastSeen - 5000) {
      console.warn('[LicenseGuard] Clock rollback detected! Last seen:', lastSeen, 'Current now:', now);
      return {
        status: 'TAMPERED',
        isActivated: false,
        isLocked: true,
        reason: 'clock_tamper',
        daysRemaining: 0,
        deviceId: currentDeviceId
      };
    }

    // فحص انتهاء الفترة التجريبية
    if (now >= trialEnd) {
      return {
        status: 'EXPIRED',
        isActivated: false,
        isLocked: true,
        reason: 'trial_expired',
        daysRemaining: 0,
        deviceId: currentDeviceId
      };
    }

    // فترة تجريبية نشطة
    const updatedState = {
      deviceId: currentDeviceId,
      aldragat_first_run: firstRun,
      aldragat_trial_end: trialEnd,
      aldragat_last_seen: now,
      aldragat_activated: false,
      aldragat_license_key: ''
    };
    writeLocalStorageState(updatedState);
    saveToIndexedDB(updatedState);

    const remainingMs = trialEnd - now;
    const daysRemaining = Math.max(1, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));

    return {
      status: 'TRIAL',
      isActivated: false,
      isLocked: false,
      daysRemaining: daysRemaining,
      deviceId: currentDeviceId
    };
  }

  // 9. دالة التفعيل والتمديد الموحدة (تقبل كود التفعيل الدائم أو كود التمديد)
  function activateSoftware(enteredCode) {
    if (!enteredCode) {
      return { success: false, message: 'يرجى إدخال كود التفعيل أو كود التمديد.' };
    }
    const clean = enteredCode.trim().toUpperCase();

    // فحص إذا كان الكود المدخل هو كود تمديد ("EXT5-...")
    if (clean.startsWith('EXT5-')) {
      const expectedExtCode = calculateExtensionCode(currentDeviceId);
      if (clean !== expectedExtCode) {
        return { success: false, message: 'كود التمديد غير صحيح! يرجى التحقق والتواصل مع المطور.' };
      }

      // التحقق من عدم استخدام كود التمديد هذا مسبقاً على هذا الجهاز
      const usedCodes = getUsedExtCodes();
      if (usedCodes.includes(clean)) {
        return { success: false, message: 'تم استخدام كود التمديد هذا مسبقاً على هذا الجهاز!' };
      }

      // حفظ الكود في قائمة الأكواد المستخدمة
      saveUsedExtCode(clean);

      // إضافة 5 أيام إضافية
      const now = Date.now();
      const local = readLocalStorageState() || {};
      const idb = cachedIdbState || {};
      const currentExpiry = resolveCurrentExpiry(local, idb, now);
      const baseTime = (now > currentExpiry) ? now : currentExpiry;
      const newExpiry = baseTime + EXTENSION_DURATION_MS;

      const state = {
        deviceId: currentDeviceId,
        aldragat_first_run: newExpiry - TRIAL_DURATION_MS,
        aldragat_trial_end: newExpiry,
        aldragat_last_seen: now,
        aldragat_activated: false,
        aldragat_license_key: ''
      };
      writeLocalStorageState(state);
      saveToIndexedDB(state);
      cachedIdbState = Object.assign({}, cachedIdbState, state);

      updateUI();
      closeOverlay();

      return { success: true, message: 'تم تمديد الفترة التجريبية بنجاح لمدة 5 أيام إضافية!' };
    }

    // وإلا، يتم فحص كود التفعيل الدائم (10 خانات)
    if (!isValidActivationCode(clean)) {
      return { success: false, message: 'كود التفعيل غير صحيح! يرجى التحقق والتواصل مع المطور عبر واتساب (0538783381).' };
    }

    const state = {
      deviceId: currentDeviceId,
      aldragat_first_run: Date.now(),
      aldragat_trial_end: Date.now() + 3153600000000,
      aldragat_last_seen: Date.now(),
      aldragat_activated: true,
      aldragat_license_key: clean
    };
    writeLocalStorageState(state);
    saveToIndexedDB(state);
    cachedIdbState = Object.assign({}, cachedIdbState, state);

    updateUI();
    closeOverlay();

    return { success: true, message: 'تم تفعيل النسخة الدائمة بنجاح مدى الحياة!' };
  }

  // 10. شارة الشريط العلوي (Header Badge)
  function renderHeaderBadge(licenseState) {
    const container = document.getElementById('licenseHeaderBadgeContainer');
    if (!container) return;

    if (licenseState.isActivated) {
      container.innerHTML = `
        <div id="licenseBadgeBtn" 
             onclick="window.LicenseGuard.openActivationModal(true)"
             style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; background: linear-gradient(135deg, #ecfdf5, #d1fae5); color: #047857; border: 1.5px solid #10b981; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.2); transition: all 0.2s ease; user-select: none;"
             title="البرنامج مفعل مدى الحياة - انقر لعرض التفاصيل">
          <span>✅</span>
          <span>نسخة مفعلة مدى الحياة</span>
        </div>
      `;
    } else if (licenseState.isLocked) {
      container.innerHTML = `
        <div id="licenseBadgeBtn" 
             onclick="window.LicenseGuard.openActivationModal(false)"
             style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; background: linear-gradient(135deg, #fef2f2, #fee2e2); color: #b91c1c; border: 1.5px solid #ef4444; box-shadow: 0 2px 6px rgba(239, 68, 68, 0.2); transition: all 0.2s ease; user-select: none; animation: pulse 2s infinite;"
             title="انتهت الفترة التجريبية - انقر لتفعيل البرنامج">
          <span>⚠️</span>
          <span>انتهت الصلاحية (مطلوب التفعيل)</span>
        </div>
      `;
    } else {
      const days = licenseState.daysRemaining;
      container.innerHTML = `
        <div id="licenseBadgeBtn" 
             onclick="window.LicenseGuard.openActivationModal(true)"
             style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; background: linear-gradient(135deg, #fffbeb, #fef3c7); color: #b45309; border: 1.5px solid #f59e0b; box-shadow: 0 2px 6px rgba(245, 158, 11, 0.2); transition: all 0.2s ease; user-select: none;"
             title="فترة تجريبية نشطة - انقر للتفعيل المبكر">
          <span>⏳</span>
          <span>فترة تجريبية (${days} ${days === 1 ? 'يوم متبقٍ' : days === 2 ? 'يومان متبقيان' : 'أيام متبقية'})</span>
        </div>
      `;
    }
  }

  // 11. بناء نافذة التفعيل المنبثقة
  function buildOverlayHTML(isEarlyActivation, deviceId) {
    const isLocked = !isEarlyActivation;
    const requestMsg = `السلام عليكم، أرغب في تفعيل برنامج إدارة الدرجات والمتابعة، رمز جهازي هو: ${deviceId}`;

    return `
      <div id="${OVERLAY_ID}" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 999999; padding: 16px; box-sizing: border-box; overflow-y: auto;">
        
        <div style="background: #ffffff; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45); width: 100%; max-width: 580px; overflow: hidden; border: 1px solid #cbd5e1; font-family: 'Tajawal', Tahoma, sans-serif; direction: rtl; display: flex; flex-direction: column;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #0f766e 0%, #115e59 100%); color: #ffffff; padding: 18px 22px; position: relative;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">🔑</span>
                <div>
                  <h3 style="margin: 0; font-size: 17px; font-weight: 800; color: #ffffff;">
                    ${isLocked ? 'انتهاء الفترة التجريبية - تفعيل النسخة' : 'تفعيل النسخة الدائمة أو التمديد'}
                  </h3>
                  <p style="margin: 2px 0 0; font-size: 12px; color: #ccfbf1;">
                    برنامج إدارة الدرجات والمتابعة الذكي للمعلمين والمعلمات
                  </p>
                </div>
              </div>
              ${
                !isLocked
                  ? `<button type="button" 
                            onclick="window.LicenseGuard.closeActivationModal()" 
                            style="background: rgba(255, 255, 255, 0.2); border: none; color: #ffffff; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; transition: background 0.2s;">✕</button>`
                  : ''
              }
            </div>
          </div>

          <!-- Price Ribbon -->
          <div style="background: #fef3c7; border-bottom: 1px solid #fde68a; padding: 8px 16px; text-align: center; color: #92400e; font-size: 12px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>⭐</span>
            <span>رسوم الاشتراك 70 ريالاً سعودياً فقط تُدفع لمرة واحدة</span>
          </div>

          <!-- Body Content -->
          <div style="padding: 18px 20px; display: flex; flex-direction: column; gap: 12px; max-height: 80vh; overflow-y: auto; -webkit-overflow-scrolling: touch;">
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-right: 4px solid #0f766e; border-radius: 12px; padding: 12px 14px; font-size: 13px; line-height: 1.7; color: #334155; text-align: justify;">
              ${isLocked 
                ? 'انتهت الفترة التجريبية المجانية (5 أيام). للاستمرار في استخدام البرنامج والاستفادة من كافة مميزاته بدون إنترنت، يسعدنا تواصلكم مع مطور البرنامج عبر واتساب وتزويده برمز جهازكم الموضح أدناه:'
                : 'يمكنكم تفعيل النسخة الدائمة مدى الحياة أو إدخال كود التمديد عبر إدخال الكود في الحقل أدناه:'}
            </div>

            <!-- صندوق التواصل السريع عبر واتساب -->
            <div style="background: rgba(16, 185, 129, 0.1); border: 1.5px solid #10b981; border-radius: 12px; padding: 12px 14px; display: flex; flex-direction: column; gap: 8px; text-align: right;">
              <div style="display: flex; align-items: flex-start; gap: 8px; color: #065f46; font-size: 12px; line-height: 1.6; font-weight: 600;">
                <i class="fab fa-whatsapp" style="color: #10b981; font-size: 20px; flex-shrink: 0; margin-top: 1px;"></i>
                <div>
                  <strong style="color: #047857; font-size: 13px; display: block; margin-bottom: 2px;">سداد الرسوم والتفعيل الفوري عبر الواتساب:</strong>
                  يُفضل بعد التحويل إرسال رسالة واتساب على الرقم <strong>0538783381</strong> لتأكيد السداد واستلام كود التفعيل فوراً.
                </div>
              </div>
              <button type="button" 
                      onclick="window.LicenseGuard.openWhatsAppContact()"
                      style="align-self: flex-start; padding: 8px 16px; font-size: 13px; font-weight: 800; background: #25d366; color: #ffffff; border: none; border-radius: 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 5px rgba(37, 211, 102, 0.3);">
                <i class="fab fa-whatsapp" style="font-size: 16px;"></i> مراسلة المطور عبر واتساب (0538783381)
              </button>
            </div>

            <!-- بطاقة معرف الجهاز الفريد -->
            <div style="background: #f8fafc; border: 1.5px dashed #0f766e; border-radius: 12px; padding: 12px 14px; text-align: center;">
              <div style="font-size: 12px; color: #64748b; font-weight: 700; margin-bottom: 4px;">
                معرّف جهازك الفريد (Device ID):
              </div>
              <div style="font-family: monospace; font-size: 20px; font-weight: 900; letter-spacing: 2px; color: #0f766e; background: #e6fffa; border: 1px solid #99f6e4; padding: 8px; border-radius: 8px; margin: 6px 0; user-select: all;">
                ${deviceId}
              </div>
              <div style="display: flex; gap: 8px; justify-content: center; margin-top: 6px; flex-wrap: wrap;">
                <button type="button" 
                        onclick="window.LicenseGuard.copyDeviceId('${deviceId}', this)"
                        style="background: #ffffff; border: 1px solid #cbd5e1; color: #1e293b; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                  <span>📋</span> <span id="txtCopyDev">نسخ المعرف فقط</span>
                </button>
                <button type="button" 
                        onclick="window.LicenseGuard.copyRequestMessage('${requestMsg}', this)"
                        style="background: #ffffff; border: 1px solid #cbd5e1; color: #1e293b; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;">
                  <span>💬</span> <span id="txtCopyMsg">نسخ رسالة الطلب كاملة</span>
                </button>
              </div>
            </div>

            <!-- إدخال كود التفعيل أو التمديد -->
            <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; text-align: right;">
              <label for="licenseKeyInput" style="display: block; font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">
                أدخل كود التفعيل الدائم أو كود التمديد (5 أيام):
              </label>
              <div style="display: flex; gap: 8px;">
                <input type="text" 
                       id="licenseKeyInput" 
                       placeholder="مثال: A1B2C3D4E5 أو EXT5-XXXXXXXX" 
                       maxlength="25"
                       autocomplete="off"
                       autocorrect="off"
                       autocapitalize="characters"
                       spellcheck="false"
                       style="flex: 1; padding: 10px 12px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 16px; font-weight: 700; font-family: monospace; text-align: center; text-transform: uppercase; direction: ltr; outline: none; background: #f8fafc;"
                       onkeydown="if(event.key === 'Enter') window.LicenseGuard.submitActivation();" />
                <button type="button" 
                        onclick="window.LicenseGuard.submitActivation()"
                        style="padding: 10px 18px; background: #0f766e; color: #ffffff; border: none; border-radius: 8px; font-size: 14px; font-weight: 800; cursor: pointer; white-space: nowrap; box-shadow: 0 2px 6px rgba(15, 118, 110, 0.3);">
                  تفعيل
                </button>
              </div>
              <div id="licenseFeedbackMsg" style="display: none; font-size: 12px; font-weight: 700; padding: 8px 10px; border-radius: 6px; margin-top: 8px; text-align: center;"></div>
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #f1f5f9; padding: 10px 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #64748b;">
            نظام حماية وتراخيص البرامج التعليمية - م. سليمان الثواب (0538783381)
          </div>

        </div>
      </div>
    `;
  }

  function showOverlay(isEarlyActivation) {
    let existing = document.getElementById(OVERLAY_ID);
    if (existing) {
      existing.remove();
    }
    const html = buildOverlayHTML(isEarlyActivation, currentDeviceId);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    document.body.appendChild(wrapper.firstChild);

    setTimeout(() => {
      const input = document.getElementById('licenseKeyInput');
      if (input) input.focus();
    }, 100);
  }

  function closeOverlay() {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) {
      existing.remove();
    }
  }

  // 12. معالجات النسخ إلى الحافظة
  function copyTextToClipboard(text, btnElement, feedbackSpanId) {
    function indicateSuccess() {
      const span = document.getElementById(feedbackSpanId);
      const originalText = span ? span.innerText : '';
      if (span) span.innerText = 'تم النسخ بنجاح! ✓';
      if (btnElement) {
        btnElement.style.background = '#ecfdf5';
        btnElement.style.borderColor = '#10b981';
      }
      setTimeout(() => {
        if (span) span.innerText = originalText;
        if (btnElement) {
          btnElement.style.background = '#ffffff';
          btnElement.style.borderColor = '#cbd5e1';
        }
      }, 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(indicateSuccess).catch(() => {
        fallbackCopy(text, indicateSuccess);
      });
    } else {
      fallbackCopy(text, indicateSuccess);
    }
  }

  function fallbackCopy(text, onSuccess) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (typeof onSuccess === 'function') onSuccess();
    } catch (e) {
      console.error('[LicenseGuard] Copy fallback failed:', e);
    }
  }

  // 13. الدورة الرئيسية وتحديث الواجهة
  let globalLicenseState = null;

  function updateUI() {
    globalLicenseState = evaluateLicenseState();
    renderHeaderBadge(globalLicenseState);

    if (typeof window.updateSubscriptionUI === 'function') {
      try { window.updateSubscriptionUI(); } catch (e) {}
    }

    const lockScreen = document.getElementById('lock-screen');
    const termsScreen = document.getElementById('terms-screen');
    const isTermsOpen = termsScreen && !termsScreen.classList.contains('hidden');
    const isLockOpen = lockScreen && !lockScreen.classList.contains('hidden');

    if (globalLicenseState.isLocked && !isTermsOpen && !isLockOpen) {
      showOverlay(false);
    }
  }

  // 14. الواجهة البرمجية العامة window.LicenseGuard
  window.LicenseGuard = {
    getDeviceId: () => currentDeviceId,
    getProgramSalt: () => PROGRAM_SALT,
    getState: () => globalLicenseState,
    evaluate: evaluateLicenseState,
    activate: activateSoftware,
    calculateExtensionCode: () => calculateExtensionCode(currentDeviceId),
    getUsedExtCodes: getUsedExtCodes,
    openActivationModal: (isEarly) => {
      showOverlay(isEarly);
    },
    closeActivationModal: () => {
      if (globalLicenseState && globalLicenseState.isLocked) {
        return;
      }
      closeOverlay();
    },
    copyDeviceId: (deviceId, btn) => {
      copyTextToClipboard(deviceId, btn, 'txtCopyDev');
    },
    copyRequestMessage: (msg, btn) => {
      copyTextToClipboard(msg, btn, 'txtCopyMsg');
    },
    copyBankValue: (text, btnElement, defaultLabel) => {
      function indicate() {
        if (!btnElement) return;
        const origHtml = btnElement.innerHTML;
        btnElement.innerHTML = '<span>✓</span> <span>تم النسخ!</span>';
        btnElement.style.background = '#ecfdf5';
        btnElement.style.borderColor = '#10b981';
        btnElement.style.color = '#047857';
        setTimeout(() => {
          btnElement.innerHTML = origHtml;
          btnElement.style.background = '';
          btnElement.style.borderColor = '';
          btnElement.style.color = '';
        }, 2000);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(indicate).catch(() => fallbackCopy(text, indicate));
      } else {
        fallbackCopy(text, indicate);
      }
    },
    openWhatsAppContact: (customMsg) => {
      const msg = customMsg || `السلام عليكم، أرغب في تفعيل برنامج إدارة الدرجات والمتابعة، رمز جهازي هو: ${currentDeviceId}`;
      const url = `https://wa.me/966${WHATSAPP_PHONE.replace(/^0/, '')}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    },
    submitActivation: (codeToSubmit) => {
      const permInput = document.getElementById('licenseKeyInput');
      const feedback = document.getElementById('licenseFeedbackMsg');
      if (!feedback) return;

      const code = (codeToSubmit || (permInput ? permInput.value : '')).trim().toUpperCase();

      if (!code) {
        feedback.style.display = 'block';
        feedback.style.background = '#fef2f2';
        feedback.style.color = '#991b1b';
        feedback.style.border = '1px solid #fecaca';
        feedback.innerText = 'يرجى إدخال الكود أولاً!';
        return;
      }

      const res = activateSoftware(code);

      feedback.style.display = 'block';
      if (res.success) {
        feedback.style.background = '#ecfdf5';
        feedback.style.color = '#065f46';
        feedback.style.border = '1px solid #a7f3d0';
        feedback.innerText = res.message;
        if (typeof window.saveData === 'function') {
          try { window.saveData(); } catch (e) {}
        }
        setTimeout(() => {
          closeOverlay();
        }, 1500);
      } else {
        feedback.style.background = '#fef2f2';
        feedback.style.color = '#991b1b';
        feedback.style.border = '1px solid #fecaca';
        feedback.innerText = res.message;
      }
    }
  };

  // 15. التهيئة التلقائية
  async function onReady() {
    await getFromIndexedDB();
    updateUI();
    setInterval(updateUI, 60000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

})();
