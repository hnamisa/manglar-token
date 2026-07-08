from __future__ import annotations

import csv
import hashlib
import json
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "mrv_observations.csv"
OUTPUT_DIR = ROOT / "mrv" / "output"


def decimal(value: str) -> float:
    return float(value.strip())


def load_observations() -> list[dict]:
    with DATA_PATH.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


def canonical_hash(payload: dict) -> str:
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
    return "0x" + hashlib.sha256(encoded).hexdigest()


def build_report() -> dict:
    observations = load_observations()
    rows = []
    gross_total = 0.0
    net_total = 0.0
    issueable_total = 0.0

    for row in observations:
        baseline = decimal(row["baseline_stock_tco2e"])
        measured = decimal(row["measured_stock_tco2e"])
        leakage = decimal(row["leakage_tco2e"])
        uncertainty = decimal(row["uncertainty_pct"])
        buffer = decimal(row["permanence_buffer_pct"])
        gross_delta = measured - baseline
        net_delta = max(gross_delta - leakage, 0)
        issueable = net_delta * (1 - uncertainty - buffer)

        gross_total += gross_delta
        net_total += net_delta
        issueable_total += issueable

        rows.append(
            {
                "plot_id": row["plot_id"],
                "zone": row["zone"],
                "area_ha": decimal(row["area_ha"]),
                "gross_delta_tco2e": round(gross_delta, 2),
                "net_delta_tco2e": round(net_delta, 2),
                "issueable_tco2e": math.floor(issueable),
                "evidence_uri": row["evidence_uri"],
            }
        )

    payload = {
        "project": "Manglar Azul Tumbes",
        "methodology": "Satellite + drone + field-plot MRV with leakage, uncertainty and permanence buffer",
        "vintage": "2025",
        "generated_at": "2025-06-15",
        "unit": "tCO2e",
        "observations": rows,
        "gross_delta_tco2e": round(gross_total, 2),
        "net_delta_tco2e": round(net_total, 2),
        "issueable_tco2e": math.floor(issueable_total),
        "notes": "Illustrative hackathon dataset. Replace with certified verifier data before production issuance.",
    }
    payload["mrv_hash"] = canonical_hash(payload)
    return payload


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    report = build_report()

    json_path = OUTPUT_DIR / "mrv_report.json"
    text_path = OUTPUT_DIR / "mrv_report.txt"

    json_path.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    text_path.write_text(
        "\n".join(
            [
                "Manglar Azul MRV Report",
                f"Vintage: {report['vintage']}",
                f"Gross delta: {report['gross_delta_tco2e']} tCO2e",
                f"Net delta: {report['net_delta_tco2e']} tCO2e",
                f"Issueable credits: {report['issueable_tco2e']} tCO2e",
                f"MRV hash: {report['mrv_hash']}",
            ]
        ),
        encoding="utf-8",
    )

    print(f"Wrote {json_path}")
    print(f"Wrote {text_path}")
    print(f"Issueable credits: {report['issueable_tco2e']} tCO2e")
    print(f"MRV hash: {report['mrv_hash']}")


if __name__ == "__main__":
    main()
