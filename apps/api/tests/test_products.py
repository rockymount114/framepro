import pytest

@pytest.mark.asyncio
async def test_list_products_api(client):
    response = await client.get("/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    skus = [p["sku"] for p in data]
    assert "FP-2201-WAL" in skus
    assert "FP-1042-BLK" in skus

@pytest.mark.asyncio
async def test_get_product_detail_api(client):
    response = await client.get("/v1/products/FP-2201-WAL")
    assert response.status_code == 200
    p = response.json()
    assert p["name"] == "Heritage Walnut & Gold Inlay"
    assert p["moq"] == 100

@pytest.mark.asyncio
async def test_get_product_not_found(client):
    response = await client.get("/v1/products/NONEXISTENT-SKU")
    assert response.status_code == 404
