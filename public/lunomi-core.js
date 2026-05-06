/* Lunomi Core Library */

var SessionManager = {
    set: function(key, value) {
        localStorage.setItem('lunomi_' + key, JSON.stringify(value));
    },
    get: function(key) {
        try { return JSON.parse(localStorage.getItem('lunomi_' + key)); } catch(e) { return null; }
    },
    clear: function() {
        Object.keys(localStorage).filter(function(k){ return k.startsWith('lunomi_'); }).forEach(function(k){ localStorage.removeItem(k); });
    },
    isValid: function() {
        return !!(this.get('session') && this.get('outlet'));
    }
};

var CurrencyCalc = {
    format: function(amount) { return Math.round(amount * 100) / 100; },
    add: function(a, b) { return this.format(a + b); },
    percentage: function(amount, percent) { return this.format((amount * percent) / 100); },
    toRp: function(amount) { return 'Rp ' + this.format(amount).toLocaleString('id-ID'); }
};

var FormValidator = {
    email: function(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); },
    phone: function(v) { return /^[0-9+\-\s]{8,15}$/.test(v); },
    password: function(v) { return v && v.length >= 6; },
    name: function(v) { return v && v.trim().length >= 2; },
    number: function(v) { return !isNaN(v) && Number(v) >= 0; },
    required: function(v) { return v !== null && v !== undefined && String(v).trim() !== ''; },
    validateForm: function(fields) {
        var self = this;
        return fields.every(function(f) { return self[f.type] ? self[f.type](f.value) : self.required(f.value); });
    }
};

var ModalManager = {
    openModal: function(id) {
        var el = document.getElementById(id);
        if (el) { el.classList.remove('hidden'); }
    },
    closeModal: function(id) {
        var el = document.getElementById(id);
        if (el) { el.classList.add('hidden'); }
    },
    closeAllModals: function() {
        document.querySelectorAll('[id$="Modal"]').forEach(function(m) { m.classList.add('hidden'); });
    }
};

var ErrorLogger = {
    logs: [],
    log: function(error, context) {
        this.logs.push({ time: new Date().toISOString(), error: String(error), context: context || {} });
        if (this.logs.length > 50) this.logs.shift();
    },
    getLogs: function() { return this.logs; }
};

var DataPersistence = {
    saveCart: function(cart) { SessionManager.set('cart', cart); },
    loadCart: function() { return SessionManager.get('cart') || []; },
    saveDraft: function(key, data) { SessionManager.set('draft_' + key, data); },
    loadDraft: function(key) { return SessionManager.get('draft_' + key); }
};

var ResponsiveHandler = {
    init: function() {
        this.handleResize();
        var self = this;
        window.addEventListener('resize', function() { self.handleResize(); });
    },
    handleResize: function() {
        document.body.classList.toggle('is-mobile', window.innerWidth < 768);
    }
};

function logout() {
    if (!confirm('Yakin ingin logout?')) return;
    SessionManager.clear();
    window.location.href = 'index.html';
}

function printReceipt(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return;
    var w = window.open('', '', 'width=400,height=600');
    w.document.write('<html><head><title>Struk</title><style>body{font-family:monospace;font-size:12px;}</style></head><body>' + el.innerHTML + '</body></html>');
    w.document.close();
    w.print();
    w.close();
}

function switchOutlet(outletId) {
    DataPersistence.saveCart([]);
    var outlets = SessionManager.get('outlets') || [];
    var outlet = outlets.find(function(o) { return o.id === outletId; });
    if (outlet) {
        SessionManager.set('outlet', outlet);
        window.location.reload();
    }
}

function initializeLunomi() {
    if (!SessionManager.isValid()) {
        window.location.href = 'index.html';
        return false;
    }
    ResponsiveHandler.init();
    window.onerror = function(msg, src, line, col, err) {
        ErrorLogger.log(err || msg, { src: src, line: line, col: col });
    };
    var outlet = SessionManager.get('outlet');
    if (outlet) {
        document.querySelectorAll('[data-outlet-name]').forEach(function(el) { el.textContent = outlet.name; });
    }
    return true;
}
