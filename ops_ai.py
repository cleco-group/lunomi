"""
OPS AI — Manajer Operasional Lunomi POS
========================================
Membaca data real-time dari Firebase Firestore, menganalisis kondisi
stok bahan baku dan transaksi, lalu mengirim laporan terstruktur (JSON)
via Gemini API ke koleksi `ops_alerts` di Firestore.

Dependencies:
    pip install -r requirements.txt

Environment Variables (.env):
    GEMINI_API_KEY              = your_gemini_api_key
    FIREBASE_SERVICE_ACCOUNT_PATH = ./serviceAccountKey.json
"""

import os
import json
import datetime
from dotenv import load_dotenv

# ── Load .env ──────────────────────────────────────────────────────────────
load_dotenv()

# ── Firebase Admin SDK ─────────────────────────────────────────────────────
import firebase_admin
from firebase_admin import credentials, firestore

# ── Gemini API ─────────────────────────────────────────────────────────────
from google import genai
from google.genai import types


# ══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ══════════════════════════════════════════════════════════════════════════════

GEMINI_API_KEY           = os.environ.get("GEMINI_API_KEY")
SERVICE_ACCOUNT_PATH     = os.environ.get("FIREBASE_SERVICE_ACCOUNT_PATH", "./serviceAccountKey.json")
OPS_MODEL                = "gemini-2.5-flash-preview-04-17"

# Alert thresholds
STOCK_ALERT_DAYS         = 3     # Stok kurang dari N hari → ALERT
ABNORMAL_ORDER_THRESHOLD = 50    # Porsi per order > N → WARNING_VOID
TRANSACTION_LOOKBACK_DAYS = 7    # Analisis transaksi N hari terakhir


# ══════════════════════════════════════════════════════════════════════════════
# FIREBASE INITIALIZATION
# ══════════════════════════════════════════════════════════════════════════════

def init_firebase() -> firestore.Client:
    """Inisialisasi Firebase Admin SDK (singleton-safe)."""
    if not firebase_admin._apps:
        # Support Base64-encoded service account for cloud deployment (Railway/Cloud Run)
        base64_key = os.environ.get("FIREBASE_SERVICE_ACCOUNT_BASE64")
        if base64_key:
            import base64
            # Decode base64 dan tulis ke temporary file
            SERVICE_ACCOUNT_PATH = "/tmp/serviceAccountKey.json"
            with open(SERVICE_ACCOUNT_PATH, "w") as f:
                f.write(base64.b64decode(base64_key).decode())
            cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
        else:
            # Fallback ke file path biasa (local development)
            cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
        firebase_admin.initialize_app(cred)
    return firestore.client()


# ══════════════════════════════════════════════════════════════════════════════
# DATA FETCHING FROM FIRESTORE
# ══════════════════════════════════════════════════════════════════════════════

def fetch_recent_transactions(db: firestore.Client) -> list[dict]:
    """Ambil transaksi dalam N hari terakhir dari koleksi `transactions`."""
    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=TRANSACTION_LOOKBACK_DAYS)
    docs = (
        db.collection("transactions")
        .where("timestamp", ">=", cutoff)
        .order_by("timestamp", direction=firestore.Query.DESCENDING)
        .limit(500)
        .stream()
    )
    transactions = []
    for doc in docs:
        d = doc.to_dict()
        # Normalisasi: hitung total porsi per transaksi
        items = d.get("items", [])
        total_qty = sum(int(i.get("qty", 0)) for i in items)
        transactions.append({
            "id":        d.get("id", doc.id),
            "date":      str(d.get("date", "")),
            "total":     d.get("total", 0),
            "items":     items,
            "total_qty": total_qty,
            "outlet_id": d.get("outlet_id", ""),
        })
    return transactions


def fetch_inventory(db: firestore.Client) -> list[dict]:
    """
    Ambil data stok bahan baku dari koleksi `inventory`.
    Setiap dokumen harus punya: name, qty, unit, daily_usage_avg.
    Jika `daily_usage_avg` tidak ada, OPS AI akan mengestimasi.
    """
    docs = db.collection("inventory").stream()
    inventory = []
    for doc in docs:
        d = doc.to_dict()
        inventory.append({
            "id":              doc.id,
            "name":            d.get("name", "Unknown"),
            "qty":             d.get("qty", 0),
            "unit":            d.get("unit", "pcs"),
            "daily_usage_avg": d.get("daily_usage_avg", None),  # bisa None
            "min_stock":       d.get("min_stock", 0),
        })
    return inventory


def fetch_expenses_summary(db: firestore.Client) -> dict:
    """Hitung total pengeluaran minggu ini dari koleksi `expenses`."""
    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=7)
    docs = db.collection("expenses").where("timestamp", ">=", cutoff).stream()
    total = 0
    count = 0
    for doc in docs:
        d = doc.to_dict()
        total += d.get("amount", 0)
        count += 1
    return {"total_this_week": total, "count": count}


# ══════════════════════════════════════════════════════════════════════════════
# PRE-ANALYSIS (rule-based cek lokal sebelum dikirim ke Gemini)
# ══════════════════════════════════════════════════════════════════════════════

def pre_analyze(transactions: list[dict], inventory: list[dict]) -> dict:
    """
    Deteksi lokal cepat untuk menyertakan konteks ke prompt Gemini.
    Return: dict dengan flag dan daftar item bermasalah.
    """
    flags = {
        "low_stock_items":     [],
        "abnormal_orders":     [],
        "has_low_stock":       False,
        "has_abnormal_orders": False,
    }

    # Cek stok rendah
    for item in inventory:
        avg = item.get("daily_usage_avg")
        if avg and avg > 0:
            days_left = item["qty"] / avg
            if days_left < STOCK_ALERT_DAYS:
                flags["low_stock_items"].append({
                    "name":      item["name"],
                    "qty":       item["qty"],
                    "unit":      item["unit"],
                    "days_left": round(days_left, 1),
                })
        elif item["qty"] <= item.get("min_stock", 0):
            flags["low_stock_items"].append({
                "name":      item["name"],
                "qty":       item["qty"],
                "unit":      item["unit"],
                "days_left": "unknown",
            })

    flags["has_low_stock"] = len(flags["low_stock_items"]) > 0

    # Cek order abnormal
    for trx in transactions:
        if trx["total_qty"] > ABNORMAL_ORDER_THRESHOLD:
            flags["abnormal_orders"].append({
                "id":        trx["id"],
                "total_qty": trx["total_qty"],
                "total":     trx["total"],
                "date":      trx["date"],
            })

    flags["has_abnormal_orders"] = len(flags["abnormal_orders"]) > 0

    return flags


# ══════════════════════════════════════════════════════════════════════════════
# GEMINI API CALL
# ══════════════════════════════════════════════════════════════════════════════

SYSTEM_INSTRUCTION = """Kamu adalah OPS AI, Manajer Operasional dari POS LUNOMI. 
Kamu hanya merespons dalam format JSON valid (tanpa markdown, tanpa penjelasan di luar JSON).

Tugasmu adalah menerima input data transaksi dan stok bahan baku lalu menganalisis kondisi operasional.

Aturan kerja:
1. Jika stok bahan baku sebuah menu kurang dari 3 hari, keluarkan status 'ALERT' dan sebutkan nama barangnya.
2. Jika ada transaksi dengan jumlah abnormal (misal pesanan > 50 porsi sekaligus), keluarkan status 'WARNING_VOID'.
3. Jika ada KEDUANYA (low stock + abnormal order), keluarkan status 'CRITICAL'.
4. Jika semua normal, keluarkan status 'SAFE'.

Format output JSON yang WAJIB digunakan:
{
  "status": "SAFE" | "ALERT" | "WARNING_VOID" | "CRITICAL",
  "summary": "Ringkasan singkat kondisi operasional dalam 1-2 kalimat.",
  "alerts": [
    {
      "type": "LOW_STOCK" | "ABNORMAL_ORDER" | "INFO",
      "item": "nama item atau ID transaksi",
      "detail": "penjelasan spesifik",
      "action": "Rekomendasi tindakan yang harus dilakukan"
    }
  ],
  "ops_score": 0-100
}

ops_score adalah nilai kesehatan operasional: 100 = sempurna, 0 = kritis."""


def call_ops_ai(data_payload: dict) -> dict:
    """
    Kirim data ke Gemini dan parse respons JSON.
    Return: dict hasil analisis OPS AI.
    """
    client = genai.Client(api_key=GEMINI_API_KEY)

    prompt = f"""Analisis data operasional Lunomi berikut dan berikan output JSON sesuai format yang ditentukan:

DATA TRANSAKSI (7 hari terakhir):
- Total transaksi: {data_payload['transaction_count']}
- Total pendapatan: Rp {data_payload['total_revenue']:,}
- Order abnormal terdeteksi: {data_payload['flags']['has_abnormal_orders']}
- Detail order abnormal: {json.dumps(data_payload['flags']['abnormal_orders'], ensure_ascii=False)}

DATA STOK BAHAN BAKU:
{json.dumps(data_payload['inventory'], indent=2, ensure_ascii=False)}

PRE-ANALYSIS:
- Item stok rendah terdeteksi: {data_payload['flags']['has_low_stock']}
- Detail item stok rendah: {json.dumps(data_payload['flags']['low_stock_items'], ensure_ascii=False)}

PENGELUARAN MINGGU INI:
- Total: Rp {data_payload['expenses']['total_this_week']:,}
- Jumlah transaksi pengeluaran: {data_payload['expenses']['count']}

Berikan analisis dan output JSON sekarang:"""

    config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(thinking_level="HIGH"),
        system_instruction=[types.Part.from_text(text=SYSTEM_INSTRUCTION)],
    )

    full_response = ""
    for chunk in client.models.generate_content_stream(
        model=OPS_MODEL,
        contents=[types.Content(role="user", parts=[types.Part.from_text(text=prompt)])],
        config=config,
    ):
        if chunk.text:
            full_response += chunk.text

    # Bersihkan markdown jika ada
    clean = full_response.strip()
    if clean.startswith("```"):
        clean = clean.split("```")[1]
        if clean.startswith("json"):
            clean = clean[4:]
    clean = clean.strip().rstrip("```").strip()

    return json.loads(clean)


# ══════════════════════════════════════════════════════════════════════════════
# WRITE RESULT TO FIRESTORE
# ══════════════════════════════════════════════════════════════════════════════

def save_alert_to_firestore(db: firestore.Client, result: dict, data_payload: dict) -> str:
    """
    Simpan hasil analisis OPS AI ke koleksi `ops_alerts` di Firestore.
    Return: document ID yang baru dibuat.
    """
    alert_doc = {
        **result,
        "analyzed_at":       firestore.SERVER_TIMESTAMP,
        "transaction_count": data_payload["transaction_count"],
        "total_revenue":     data_payload["total_revenue"],
        "inventory_count":   len(data_payload["inventory"]),
        "model_used":        OPS_MODEL,
    }
    _, doc_ref = db.collection("ops_alerts").add(alert_doc)
    return doc_ref.id


# ══════════════════════════════════════════════════════════════════════════════
# MAIN RUNNER
# ══════════════════════════════════════════════════════════════════════════════

def run_ops_analysis() -> dict:
    """
    Fungsi utama: jalankan seluruh pipeline OPS AI.
    Return: dict hasil analisis lengkap.
    """
    print("🤖 OPS AI Lunomi — Memulai analisis operasional...")

    # 1. Validasi environment
    if not GEMINI_API_KEY:
        raise EnvironmentError("GEMINI_API_KEY tidak ditemukan di environment variables.")
    if not os.path.exists(SERVICE_ACCOUNT_PATH):
        raise FileNotFoundError(f"serviceAccountKey.json tidak ditemukan di: {SERVICE_ACCOUNT_PATH}")

    # 2. Inisialisasi Firebase
    print("🔥 Menghubungkan ke Firebase Firestore...")
    db = init_firebase()

    # 3. Ambil data dari Firestore
    print("📦 Mengambil data transaksi, stok, dan pengeluaran...")
    transactions = fetch_recent_transactions(db)
    inventory    = fetch_inventory(db)
    expenses     = fetch_expenses_summary(db)

    total_revenue = sum(t["total"] for t in transactions)

    # 4. Pre-analisis lokal
    flags = pre_analyze(transactions, inventory)

    # 5. Siapkan payload
    data_payload = {
        "transaction_count": len(transactions),
        "total_revenue":     total_revenue,
        "inventory":         inventory,
        "expenses":          expenses,
        "flags":             flags,
    }

    print(f"📊 Data siap: {len(transactions)} transaksi, {len(inventory)} item stok")
    print("🧠 Mengirim ke Gemini OPS AI (thinking: HIGH)...")

    # 6. Panggil Gemini
    result = call_ops_ai(data_payload)

    print(f"\n✅ Analisis selesai!")
    print(f"   Status   : {result.get('status', 'N/A')}")
    print(f"   OPS Score: {result.get('ops_score', 'N/A')}/100")
    print(f"   Summary  : {result.get('summary', '')}")

    # 7. Simpan ke Firestore
    doc_id = save_alert_to_firestore(db, result, data_payload)
    result["firestore_id"] = doc_id
    print(f"💾 Tersimpan ke Firestore: ops_alerts/{doc_id}")

    return result


if __name__ == "__main__":
    result = run_ops_analysis()
    print("\n📋 Output JSON Lengkap:")
    print(json.dumps(result, indent=2, ensure_ascii=False))
