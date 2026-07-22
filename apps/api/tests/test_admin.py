import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_admin_product_lifecycle(client: AsyncClient):
    headers = {"X-Admin-Key": "framepro-admin-key-9f8e7d6c"}

    # 1. Create product
    payload = {
        "sku": "ADM-FRAME-001",
        "name": "Admin Test Luxury Frame",
        "material": "PS Composite",
        "finish": "Glossy Gold",
        "color": "Gold",
        "width_mm": 45.0,
        "depth_mm": 25.0,
        "moq": 50,
        "retail_price_cents": 3500,
        "wholesale_price_cents": 1800
    }
    create_res = await client.post("/v1/admin/products", json=payload, headers=headers)
    assert create_res.status_code == 200
    assert create_res.json()["sku"] == "ADM-FRAME-001"

    # 2. List products
    list_res = await client.get("/v1/admin/products", headers=headers)
    assert list_res.status_code == 200
    skus = [p["sku"] for p in list_res.json()["items"]]
    assert "ADM-FRAME-001" in skus

    # 3. Patch product
    patch_res = await client.patch(
        "/v1/admin/products/ADM-FRAME-001",
        json={"name": "Updated Admin Frame", "retail_price_cents": 3900},
        headers=headers
    )
    assert patch_res.status_code == 200

    # 4. Delete product
    del_res = await client.delete("/v1/admin/products/ADM-FRAME-001", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

@pytest.mark.asyncio
async def test_admin_crm_and_audit_logs(client: AsyncClient):
    headers = {"X-Admin-Key": "framepro-admin-key-9f8e7d6c"}

    # List CRM leads
    crm_res = await client.get("/v1/admin/crm/leads", headers=headers)
    assert crm_res.status_code == 200

    # Check top analytics
    top_res = await client.get("/v1/admin/analytics/products/top", headers=headers)
    assert top_res.status_code == 200

    # Audit logs
    audit_res = await client.get("/v1/admin/audit-logs", headers=headers)
    assert audit_res.status_code == 200
    assert "items" in audit_res.json()
