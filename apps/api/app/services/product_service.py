from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from packages.database.models import FrameProfile, FrameImage
from packages.database.repositories import FrameProfileRepository

class ProductService:
    @classmethod
    async def seed_initial_catalog(cls, session: AsyncSession):
        repo = FrameProfileRepository(session)
        existing = await repo.get_by_sku("FP-2201-WAL")
        if existing:
            return

        sample_products = [
            {
                "sku": "FP-2201-WAL",
                "name": "Heritage Walnut & Gold Inlay",
                "material": "PS Moulding",
                "finish": "Walnut Wood Grain",
                "texture": "Smooth Matte with Gold Bevel",
                "wood_grain": "American Walnut",
                "color": "Walnut / Gold",
                "width_mm": 55.0,
                "depth_mm": 35.0,
                "application": "Wall Art & Mirror",
                "weight_g_per_m": 420.0,
                "moq": 100,
                "container_qty": 5000,
                "retail_price_cents": 2800,      # $28.00/m
                "wholesale_price_cents": 1400,   # $14.00/m
                "currency": "USD"
            },
            {
                "sku": "FP-1042-BLK",
                "name": "Minimalist Obsidian Black",
                "material": "PS Moulding",
                "finish": "Satin Black",
                "texture": "Fine Grain Satin",
                "wood_grain": None,
                "color": "Black",
                "width_mm": 40.0,
                "depth_mm": 25.0,
                "application": "Modern Art & Photography",
                "weight_g_per_m": 310.0,
                "moq": 100,
                "container_qty": 6000,
                "retail_price_cents": 1900,      # $19.00/m
                "wholesale_price_cents": 950,    # $9.50/m
                "currency": "USD"
            },
            {
                "sku": "FP-3088-GLD",
                "name": "Imperial Champagne Gold",
                "material": "PS Moulding",
                "finish": "Brushed Foil",
                "texture": "Metallic Leaf",
                "wood_grain": None,
                "color": "Gold",
                "width_mm": 65.0,
                "depth_mm": 40.0,
                "application": "Luxury Hotel & Gallery",
                "weight_g_per_m": 580.0,
                "moq": 100,
                "container_qty": 4000,
                "retail_price_cents": 3600,      # $36.00/m
                "wholesale_price_cents": 1800,   # $18.00/m
                "currency": "USD"
            }
        ]

        for p_data in sample_products:
            await repo.create(**p_data)
