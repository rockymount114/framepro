from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from packages.database.repositories import FrameProfileRepository
from packages.shared.schemas import FrameProfileOut, ProductPricingOut
from apps.api.app.dependencies import get_db

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[FrameProfileOut])
async def list_products(
    material: Optional[str] = Query(None),
    finish: Optional[str] = Query(None),
    color: Optional[str] = Query(None),
    session: AsyncSession = Depends(get_db)
):
    repo = FrameProfileRepository(session)
    products = await repo.list_all(material=material, finish=finish, color=color)
    return products

@router.get("/{sku}", response_model=FrameProfileOut)
async def get_product(sku: str, session: AsyncSession = Depends(get_db)):
    repo = FrameProfileRepository(session)
    product = await repo.get_by_sku(sku)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with SKU '{sku}' not found")
    return product

@router.get("/{sku}/pricing", response_model=ProductPricingOut)
async def get_product_pricing(sku: str, session: AsyncSession = Depends(get_db)):
    repo = FrameProfileRepository(session)
    product = await repo.get_by_sku(sku)
    if not product:
        raise HTTPException(status_code=404, detail=f"Product with SKU '{sku}' not found")
    return ProductPricingOut(
        sku=product.sku,
        retail_price_cents=product.retail_price_cents,
        wholesale_price_cents=product.wholesale_price_cents,
        currency=product.currency,
        moq=product.moq
    )
