import io
import pytest


def test_reports_export_and_sample(client, auth_headers):
    # Seed sample transactions
    client.post("/api/v1/transactions/seed", headers=auth_headers)

    # 1. Download Sample CSV
    sample_res = client.get("/api/v1/reports/sample-csv")
    assert sample_res.status_code == 200
    assert "Date,Description,Amount,Type,Category" in sample_res.text

    # 2. Export CSV
    export_res = client.get("/api/v1/reports/export-csv", headers=auth_headers)
    assert export_res.status_code == 200
    assert "attachment; filename=\"finwise_transactions.csv\"" in export_res.headers.get("content-disposition", "")
    assert "Date,Description,Amount,Type,Category" in export_res.text


def test_reports_csv_import_and_duplicate_detection(client, auth_headers):
    csv_payload = (
        "Date,Description,Amount,Type,Category\n"
        "2026-11-01,Zomato Dinner Delivery,650,expense,Food\n"
        "2026-11-02,Flipkart Diwali Shopping,4200,expense,Shopping\n"
        "2026-11-03,Freelance Consulting Payment,35000,income,Salary\n"
    )

    # 1. First Import
    files = {"file": ("test_import.csv", io.BytesIO(csv_payload.encode("utf-8")), "text/csv")}
    res1 = client.post("/api/v1/reports/import-csv", headers=auth_headers, files=files)
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["imported_count"] == 3
    assert data1["duplicates_skipped"] == 0

    # 2. Duplicate Import (upload same CSV again)
    files_dup = {"file": ("test_import.csv", io.BytesIO(csv_payload.encode("utf-8")), "text/csv")}
    res2 = client.post("/api/v1/reports/import-csv", headers=auth_headers, files=files_dup)
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["imported_count"] == 0
    assert data2["duplicates_skipped"] == 3
