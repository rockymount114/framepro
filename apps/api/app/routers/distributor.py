from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from apps.api.app.dependencies import get_db, get_current_user

router = APIRouter(prefix="/distributor", tags=["Distributor Portal"])

@router.get("/inventory")
async def get_distributor_inventory(session: AsyncSession = Depends(get_db)):
    return [
        {"sku": "FP-2201-WAL", "warehouse": "US-West (California)", "quantity_on_hand": 14500, "quantity_reserved": 2000},
        {"sku": "FP-1042-BLK", "warehouse": "US-East (New Jersey)", "quantity_on_hand": 22000, "quantity_reserved": 3500},
        {"sku": "FP-3088-GLD", "warehouse": "Asia-Central (Ningbo)", "quantity_on_hand": 45000, "quantity_reserved": 8000}
    ]

@router.get("/containers")
async def get_container_planning():
    return [
        {"container_id": "CONT-2026-088", "status": "in_transit", "origin": "Ningbo Port", "destination": "Port of Long Beach", "eta": "2026-08-04", "capacity_utilized_pct": 98.5},
        {"container_id": "CONT-2026-092", "status": "production", "origin": "Factory Hub 1", "destination": "Port of Newark", "eta": "2026-08-22", "capacity_utilized_pct": 74.0}
    ]

@router.post("/samples")
async def request_sample_kit(user = Depends(get_current_user)):
    return {"status": "requested", "tracking_number": "SMP-88392-US", "message": "Master Moulding Sample Box dispatched."}
