from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from packages.config.settings import settings
from packages.database.connection import init_db, AsyncSessionLocal
from apps.api.app.services.product_service import ProductService
from apps.api.app.routers import auth, products, ai, quotations, orders, distributor, crm, inventory

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB schema & seed catalog
    await init_db()
    async with AsyncSessionLocal() as session:
        await ProductService.seed_initial_catalog(session)
        await session.commit()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include domain routers
v1_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=v1_prefix)
app.include_router(products.router, prefix=v1_prefix)
app.include_router(ai.router, prefix=v1_prefix)
app.include_router(quotations.router, prefix=v1_prefix)
app.include_router(orders.router, prefix=v1_prefix)
app.include_router(distributor.router, prefix=v1_prefix)
app.include_router(crm.router, prefix=v1_prefix)
app.include_router(inventory.router, prefix=v1_prefix)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "FramePro API", "version": settings.VERSION}
