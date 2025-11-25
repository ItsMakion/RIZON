import pytest
from httpx import AsyncClient

@pytest.mark.anyio
async def test_register_user(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "password123", "role": "customer"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

@pytest.mark.anyio
async def test_login_user(client: AsyncClient):
    # First register
    await client.post(
        "/api/v1/auth/register",
        json={"email": "login@example.com", "password": "password123", "role": "customer"},
    )
    
    # Then login
    response = await client.post(
        "/api/v1/auth/login",
        data={"username": "login@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
