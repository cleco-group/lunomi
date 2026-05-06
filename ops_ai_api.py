"""
OPS AI API Server — Flask HTTP Endpoint untuk Lunomi Dashboard
==============================================================
Meng-expose OPS AI sebagai REST API yang bisa dipanggil dari dashboard.html.

Endpoints:
    GET  /api/ops/status   → Jalankan analisis OPS AI sekarang
    GET  /api/ops/history  → Ambil 10 alert terakhir dari Firestore
    GET  /api/ops/health   → Health check server

Cara menjalankan:
    python ops_ai_api.py

Server akan berjalan di: http://localhost:5050
"""

import os
import json
import datetime
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

# ── Import OPS AI core ────────────────────────────────────────────────────────
from ops_ai import run_ops_analysis, init_firebase

# ── Firebase Admin ────────────────────────────────────────────────────────────
from firebase_admin import firestore

# ══════════════════════════════════════════════════════════════════════════════
# FLASK APP SETUP
# ══════════════════════════════════════════════════════════════════════════════

app = Flask(__name__)
CORS(app, origins=["*"])  # Allow requests from dashboard.html

OPS_AI_TOKEN = os.environ.get("OPS_AI_TOKEN", "lunomi-ops-secret")
PORT         = int(os.environ.get("OPS_AI_PORT", 5050))


# ══════════════════════════════════════════════════════════════════════════════
# MIDDLEWARE — Simple Token Auth
# ══════════════════════════════════════════════════════════════════════════════

def check_auth() -> bool:
    """Verifikasi Bearer token dari header Authorization."""
    auth = request.headers.get("Authorization", "")
    token = auth.replace("Bearer ", "").strip()
    return token == OPS_AI_TOKEN


# ══════════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@app.route("/api/ops/health", methods=["GET"])
def health():
    """Health check endpoint — tidak perlu auth."""
    return jsonify({
        "status":    "online",
        "service":   "OPS AI Lunomi",
        "timestamp": datetime.datetime.now().isoformat(),
    })


@app.route("/api/ops/status", methods=["GET"])
def get_ops_status():
    """
    Jalankan analisis OPS AI secara penuh dan simpan ke Firestore.
    Membutuhkan Bearer token.
    """
    if not check_auth():
        return jsonify({"error": "Unauthorized. Sertakan Bearer token yang valid."}), 401

    try:
        result = run_ops_analysis()
        return jsonify({
            "success": True,
            "data":    result,
        })
    except FileNotFoundError as e:
        return jsonify({
            "success": False,
            "error":   f"Service Account Key tidak ditemukan: {str(e)}",
            "hint":    "Letakkan serviceAccountKey.json di folder yang sama dengan ops_ai.py",
        }), 503
    except Exception as e:
        return jsonify({
            "success": False,
            "error":   str(e),
        }), 500


@app.route("/api/ops/history", methods=["GET"])
def get_ops_history():
    """
    Ambil 10 riwayat alert OPS AI terakhir dari koleksi `ops_alerts`.
    Membutuhkan Bearer token.
    """
    if not check_auth():
        return jsonify({"error": "Unauthorized."}), 401

    try:
        db    = init_firebase()
        limit = int(request.args.get("limit", 10))
        docs  = (
            db.collection("ops_alerts")
            .order_by("analyzed_at", direction=firestore.Query.DESCENDING)
            .limit(limit)
            .stream()
        )

        history = []
        for doc in docs:
            d = doc.to_dict()
            # Konversi Timestamp Firestore ke string ISO
            if "analyzed_at" in d and hasattr(d["analyzed_at"], "isoformat"):
                d["analyzed_at"] = d["analyzed_at"].isoformat()
            d["id"] = doc.id
            history.append(d)

        return jsonify({
            "success": True,
            "count":   len(history),
            "data":    history,
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/ops/mock", methods=["GET"])
def get_mock_status():
    """
    Endpoint MOCK untuk demo tanpa Firebase/Gemini.
    Bisa digunakan untuk testing dashboard sebelum serviceAccountKey tersedia.
    """
    import random
    statuses = ["SAFE", "ALERT", "WARNING_VOID"]
    status   = random.choice(statuses)

    mock = {
        "status":    status,
        "ops_score": random.randint(60, 100) if status == "SAFE" else random.randint(20, 59),
        "summary":   "Ini adalah data mock untuk keperluan testing dashboard.",
        "alerts": [
            {
                "type":   "LOW_STOCK",
                "item":   "Ayam Fillet",
                "detail": "Stok tersisa 2 kg, estimasi habis dalam 1.5 hari.",
                "action": "Segera order ke supplier langganan min. 10 kg.",
            }
        ] if status != "SAFE" else [],
        "analyzed_at":       datetime.datetime.now().isoformat(),
        "transaction_count": 42,
        "total_revenue":     3_250_000,
        "model_used":        "mock",
    }
    return jsonify({"success": True, "data": mock})


# ══════════════════════════════════════════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    print(f"🤖 OPS AI API Server mulai di http://localhost:{PORT}")
    print(f"   Health  : http://localhost:{PORT}/api/ops/health")
    print(f"   Status  : http://localhost:{PORT}/api/ops/status  [Bearer Token Required]")
    print(f"   History : http://localhost:{PORT}/api/ops/history [Bearer Token Required]")
    print(f"   Mock    : http://localhost:{PORT}/api/ops/mock    [No Auth]")
    app.run(host="0.0.0.0", port=PORT, debug=False)
