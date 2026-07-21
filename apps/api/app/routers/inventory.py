from fastapi import APIRouter

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("/{sku}")
async def get_sku_inventory(sku: str):
    return {
        "sku": sku,
        "total_available_m": 36500,
        "warehouses": [
            {"warehouse": "US-West", "available": 14500},
            {"warehouse": "US-East", "available": 22000}
        ]
    }

@router.get("/production-status")
async def get_production_status():
    return {
        "active_production_runs": 4,
        "scheduled_completion": "2026-08-10",
        "units_in_production": 85000
    }
