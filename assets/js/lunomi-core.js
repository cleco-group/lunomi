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

/* ═══════════════════════════════════════════════
   LunomiDB — Shared Data Layer (semua modul pakai ini)
   ═══════════════════════════════════════════════ */
var LunomiDB = {

    /* ── Customers ─────────────────────────────── */
    getCustomers: function() { return SessionManager.get('customers') || []; },
    saveCustomers: function(data) { SessionManager.set('customers', data); },
    addCustomer: function(c) {
        var list = this.getCustomers();
        c.id = 'C' + Date.now();
        c.tier = 'Bronze';
        c.totalSpend = 0;
        c.points = 0;
        c.createdAt = new Date().toISOString();
        c.notes = c.notes || '';
        list.unshift(c);
        this.saveCustomers(list);
        AuditLog.add('customer_add', 'Tambah customer: ' + c.name);
        return c;
    },
    updateCustomer: function(id, fields) {
        var list = this.getCustomers();
        var idx = list.findIndex(function(c){ return c.id === id; });
        if (idx > -1) {
            Object.assign(list[idx], fields);
            this.saveCustomers(list);
            AuditLog.add('customer_edit', 'Edit customer: ' + list[idx].name);
        }
        return list[idx] || null;
    },
    deleteCustomer: function(id) {
        var list = this.getCustomers();
        var c = list.find(function(x){ return x.id === id; });
        var filtered = list.filter(function(x){ return x.id !== id; });
        this.saveCustomers(filtered);
        if (c) AuditLog.add('customer_delete', 'Hapus customer: ' + c.name);
    },
    findCustomer: function(id) {
        return this.getCustomers().find(function(c){ return c.id === id; }) || null;
    },
    getTier: function(spend) {
        if (spend >= 10000000) return 'Platinum';
        if (spend >= 5000000)  return 'Gold';
        if (spend >= 1000000)  return 'Silver';
        return 'Bronze';
    },
    recalcTier: function(customerId) {
        var c = this.findCustomer(customerId);
        if (!c) return;
        var trxs = this.getTransactions().filter(function(t){ return t.customerId === customerId; });
        var total = trxs.reduce(function(s, t){ return s + (t.total || 0); }, 0);
        this.updateCustomer(customerId, { totalSpend: total, tier: this.getTier(total) });
    },

    /* ── Transactions ───────────────────────────── */
    getTransactions: function() { return SessionManager.get('transactions') || []; },
    saveTransactions: function(data) { SessionManager.set('transactions', data); },
    addTransaction: function(trx) {
        var list = this.getTransactions();
        trx.id = trx.id || ('T' + Date.now());
        trx.createdAt = trx.createdAt || new Date().toISOString();
        list.unshift(trx);
        this.saveTransactions(list);
        /* Award loyalty points if customer attached */
        if (trx.customerId) {
            var pts = Math.floor((trx.total || 0) / 10000);
            LoyaltyEngine.addPoints(trx.customerId, pts, 'Transaksi #' + trx.id);
            this.recalcTier(trx.customerId);
        }
        AuditLog.add('transaction', 'Transaksi ' + trx.id + ' Rp ' + (trx.total||0).toLocaleString('id-ID'));
        return trx;
    },
    getTransactionById: function(id) {
        return this.getTransactions().find(function(t){ return t.id === id; }) || null;
    },
    getCustomerTransactions: function(customerId) {
        return this.getTransactions().filter(function(t){ return t.customerId === customerId; });
    },

    /* ── Invoices ───────────────────────────────── */
    getInvoices: function() { return SessionManager.get('invoices') || []; },
    saveInvoices: function(data) { SessionManager.set('invoices', data); },
    createInvoice: function(trxId, extra) {
        var trx = this.getTransactionById(trxId);
        if (!trx) return null;
        var list = this.getInvoices();
        var no = 'INV' + String(list.length + 1).padStart(5, '0');
        var inv = Object.assign({ invoiceNo: no, trxId: trxId, issuedAt: new Date().toISOString(), status: 'unpaid' }, trx, extra || {});
        list.unshift(inv);
        this.saveInvoices(list);
        AuditLog.add('invoice', 'Buat invoice ' + no);
        return inv;
    },
    updateInvoiceStatus: function(invoiceNo, status) {
        var list = this.getInvoices();
        var inv = list.find(function(i){ return i.invoiceNo === invoiceNo; });
        if (inv) { inv.status = status; this.saveInvoices(list); }
    }
};

/* ═══════════════════════════════════════════════
   LoyaltyEngine — Sistem Poin & Reward
   ═══════════════════════════════════════════════ */
var LoyaltyEngine = {
    getLedger: function() { return SessionManager.get('loyalty_ledger') || []; },
    saveLedger: function(data) { SessionManager.set('loyalty_ledger', data); },
    addPoints: function(customerId, pts, reason) {
        if (!customerId || pts <= 0) return;
        var ledger = this.getLedger();
        ledger.unshift({ id: 'LP' + Date.now(), customerId: customerId, pts: pts, reason: reason || '', type: 'earn', at: new Date().toISOString() });
        this.saveLedger(ledger);
        var customers = LunomiDB.getCustomers();
        var idx = customers.findIndex(function(c){ return c.id === customerId; });
        if (idx > -1) { customers[idx].points = (customers[idx].points || 0) + pts; LunomiDB.saveCustomers(customers); }
    },
    redeemPoints: function(customerId, pts, reason) {
        var c = LunomiDB.findCustomer(customerId);
        if (!c || c.points < pts) return false;
        var ledger = this.getLedger();
        ledger.unshift({ id: 'LP' + Date.now(), customerId: customerId, pts: -pts, reason: reason || 'Redeem poin', type: 'redeem', at: new Date().toISOString() });
        this.saveLedger(ledger);
        var customers = LunomiDB.getCustomers();
        var idx = customers.findIndex(function(c){ return c.id === customerId; });
        if (idx > -1) { customers[idx].points -= pts; LunomiDB.saveCustomers(customers); }
        AuditLog.add('loyalty_redeem', customerId + ' redeem ' + pts + ' poin');
        return true;
    },
    getCustomerLedger: function(customerId) {
        return this.getLedger().filter(function(l){ return l.customerId === customerId; });
    }
};

/* ═══════════════════════════════════════════════
   AuditLog — Activity Trail
   ═══════════════════════════════════════════════ */
var AuditLog = {
    get: function() { return SessionManager.get('audit_log') || []; },
    save: function(data) { SessionManager.set('audit_log', data); },
    add: function(action, detail) {
        var logs = this.get();
        var session = SessionManager.get('session');
        logs.unshift({
            id: 'AL' + Date.now(),
            action: action,
            detail: detail,
            user: session ? session.user.name : 'System',
            at: new Date().toISOString()
        });
        if (logs.length > 500) logs = logs.slice(0, 500);
        this.save(logs);
    },
    getRecent: function(n) { return this.get().slice(0, n || 50); }
};

/* ═══════════════════════════════════════════════
   WhatsApp Helper
   ═══════════════════════════════════════════════ */
var WAHelper = {
    send: function(phone, msg) {
        var clean = String(phone).replace(/[^0-9]/g, '');
        if (clean.startsWith('0')) clean = '62' + clean.slice(1);
        var url = 'https://wa.me/' + clean + '?text=' + encodeURIComponent(msg);
        window.open(url, '_blank');
    },
    receiptMsg: function(trx, outletName) {
        var items = (trx.items || []).map(function(i){ return '  • ' + i.name + ' x' + i.qty + '  Rp ' + (i.price * i.qty).toLocaleString('id-ID'); }).join('\n');
        return [
            '🧾 *STRUK ' + (outletName || 'LUNOMI') + '*',
            '━━━━━━━━━━━━━━━━━',
            'No: #' + trx.id,
            'Tanggal: ' + new Date(trx.createdAt).toLocaleString('id-ID'),
            '━━━━━━━━━━━━━━━━━',
            items,
            '━━━━━━━━━━━━━━━━━',
            'Total: *Rp ' + (trx.total || 0).toLocaleString('id-ID') + '*',
            'Bayar: ' + (trx.payMethod || '-'),
            '',
            'Terima kasih telah berbelanja! 🙏'
        ].join('\n');
    }
};

var RecipeManager = {
    saveRecipe: function(menuId, ingredients) {
        var recipes = SessionManager.get('recipes') || {};
        recipes[menuId] = ingredients;
        SessionManager.set('recipes', recipes);
    },
    getRecipe: function(menuId) {
        var recipes = SessionManager.get('recipes') || {};
        return recipes[menuId] || [];
    },
    getAllRecipes: function() {
        return SessionManager.get('recipes') || {};
    },
    deductStock: function(menuId, qty) {
        var recipe = this.getRecipe(menuId);
        if (!recipe.length) return;
        
        var stock = SessionManager.get('raw_stock') || {};
        recipe.forEach(function(ing) {
            if (stock[ing.rawId]) {
                stock[ing.rawId].qty -= (ing.qty * qty);
            }
        });
        SessionManager.set('raw_stock', stock);
    }
};
