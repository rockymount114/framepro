import pytest

@pytest.mark.asyncio
async def test_ai_frame_preview_endpoint(client):
    payload = {
        "frame_sku": "FP-2201-WAL",
        "material": "walnut",
        "width_mm": 55.0,
        "mat_board_cm": 5.0
    }
    response = await client.post("/v1/ai/frame-preview", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "completed"
    assert data["result_url"].startswith("data:image/jpeg;base64,")

@pytest.mark.asyncio
async def test_ai_recommend_endpoint(client):
    payload = {"image_style": "modern_abstract"}
    response = await client.post("/v1/ai/recommend", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommendations" in data
    assert len(data["recommendations"]) == 3

@pytest.mark.asyncio
async def test_ai_chat_endpoint(client):
    payload = {"message": "Tell me about wholesale pricing for walnut frames"}
    response = await client.post("/v1/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "distributor" in data["reply"].lower() or "wholesale" in data["reply"].lower()
