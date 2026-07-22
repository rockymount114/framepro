import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_admin_user_management_lifecycle(client: AsyncClient):
    headers = {"X-Admin-Key": "framepro-admin-key-9f8e7d6c"}

    # 1. Create a staff user
    staff_payload = {
        "email": "sarah.manager@framepro.com",
        "full_name": "Sarah Jenkins",
        "role": "manager"
    }
    create_res = await client.post("/v1/admin/users", json=staff_payload, headers=headers)
    assert create_res.status_code == 200
    staff_data = create_res.json()
    assert staff_data["status"] == "success"
    staff_id = staff_data["id"]
    assert staff_data["role"] == "manager"

    # 2. List users
    list_res = await client.get("/v1/admin/users", headers=headers)
    assert list_res.status_code == 200
    items = list_res.json()["items"]
    assert any(u["id"] == staff_id for u in items)

    # 3. Update staff user role to admin
    update_res = await client.patch(
        f"/v1/admin/users/{staff_id}",
        json={"role": "admin", "full_name": "Sarah Jenkins (Director)"},
        headers=headers
    )
    assert update_res.status_code == 200
    assert update_res.json()["role"] == "admin"

    # 4. Filter users by role
    filtered_res = await client.get("/v1/admin/users?role=admin", headers=headers)
    assert filtered_res.status_code == 200
    admin_items = filtered_res.json()["items"]
    assert any(u["id"] == staff_id for u in admin_items)

    # 5. Delete staff user
    del_res = await client.delete(f"/v1/admin/users/{staff_id}", headers=headers)
    assert del_res.status_code == 200
    assert del_res.json()["status"] == "deleted"

@pytest.mark.asyncio
async def test_admin_user_management_rbac_protection(client: AsyncClient):
    # Unauthenticated or distributor user attempts to manage users -> forbidden (403)
    res = await client.get("/v1/admin/users")
    assert res.status_code == 403

    create_res = await client.post("/v1/admin/users", json={"email": "hacker@test.com", "full_name": "Hacker", "role": "admin"})
    assert create_res.status_code == 403

@pytest.mark.asyncio
async def test_admin_login_and_jwt_auth(client: AsyncClient):
    # Login as admin user
    login_res = await client.post("/v1/auth/login", json={"email": "admin@framepro.com", "password": "password123"})
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert token_data["role"] == "admin"
    assert token_data["access_token"].startswith("jwt_")

    jwt_token = token_data["access_token"]
    bearer_headers = {"Authorization": f"Bearer {jwt_token}"}

    # Access admin users endpoint using JWT token
    res = await client.get("/v1/admin/users", headers=bearer_headers)
    assert res.status_code == 200
    assert "items" in res.json()
