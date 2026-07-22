import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_ai_chat_session_persistence_and_deepseek_integration(client: AsyncClient):
    # 1. Initial chat message
    payload = {
        "message": "Hello, I want to inquire about wholesale pricing for walnut moulding FP-2201-WAL"
    }
    res = await client.post("/v1/ai/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "session_id" in data
    assert "reply" in data
    session_id = data["session_id"]
    assert len(data["reply"]) > 0

    # 2. Continue conversation in same session
    followup_payload = {
        "session_id": session_id,
        "message": "What is the MOQ for this frame profile?"
    }
    res2 = await client.post("/v1/ai/chat", json=followup_payload)
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["session_id"] == session_id
    assert data2["message_count"] == 2

@pytest.mark.asyncio
async def test_admin_ai_chat_logs_review(client: AsyncClient):
    headers = {"X-Admin-Key": "framepro-admin-key-9f8e7d6c"}

    # Create a chat session first
    chat_res = await client.post("/v1/ai/chat", json={"message": "Can I get a catalog for gold profiles?"})
    assert chat_res.status_code == 200
    session_id = chat_res.json()["session_id"]

    # List chat sessions as admin
    list_res = await client.get("/v1/admin/ai-chats", headers=headers)
    assert list_res.status_code == 200
    items = list_res.json()["items"]
    assert any(s["id"] == session_id for s in items)

    # Get session transcript detail
    detail_res = await client.get(f"/v1/admin/ai-chats/{session_id}", headers=headers)
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert detail["id"] == session_id
    assert len(detail["messages"]) >= 2
    assert detail["messages"][0]["sender"] == "user"
    assert detail["messages"][1]["sender"] == "assistant"

@pytest.mark.asyncio
async def test_admin_ai_chats_rbac_protection(client: AsyncClient):
    # Unauthenticated/distributor attempt to access chat logs -> 403 Forbidden
    res = await client.get("/v1/admin/ai-chats")
    assert res.status_code == 403
