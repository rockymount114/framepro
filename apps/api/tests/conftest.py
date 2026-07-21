import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from packages.database.connection import engine, Base, AsyncSessionLocal
from apps.api.app.services.product_service import ProductService
from apps.api.app.main import app

@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_test_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as session:
        await ProductService.seed_initial_catalog(session)
        await session.commit()
    
    yield
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture(scope="function")
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
