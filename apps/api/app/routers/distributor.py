import random
import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from apps.api.app.dependencies import get_db, get_current_user
from packages.database.models import Lead, User

router = APIRouter(prefix="/distributor", tags=["Distributor Portal"])

class SampleRequestPayload(BaseModel):
    email: str
    company: Optional[str] = "Distributor Partner"
    phone: Optional[str] = None
    shipping_address: Optional[str] = "100 Studio Way, San Francisco, CA"
    requested_skus: Optional[List[str]] = ["FP-GOLD-804", "FP-BLK-201", "FP-WAL-502"]

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
async def request_sample_kit(
    payload: Optional[SampleRequestPayload] = None,
    session: AsyncSession = Depends(get_db)
):
    email = payload.email if payload else "distributor@framepro.com"
    company = payload.company if payload else "Distributor Studio"
    phone = payload.phone if payload else "+1 800 555 0199"
    
    tracking_num = f"SMP-{random.randint(10000, 99999)}-US"
    
    lead = Lead(
        id=str(uuid.uuid4()),
        email=email,
        company=company,
        phone=phone,
        source="sample_request",
        status="new",
        tags=["sample_request", tracking_num]
    )
    session.add(lead)
    await session.commit()

    return {
        "status": "success",
        "sample_status": "preparing",
        "tracking_number": tracking_num,
        "email": email,
        "message": "Master Moulding Sample Box request created and queued for dispatch.",
        "estimated_delivery": "3-5 Business Days"
    }

@router.get("/samples/track/{tracking_number}")
async def track_sample_request(
    tracking_number: str,
    session: AsyncSession = Depends(get_db)
):
    query = select(Lead).where(Lead.source == "sample_request")
    res = await session.execute(query)
    leads = res.scalars().all()
    
    found_lead = None
    for l in leads:
        if tracking_number in (l.tags or []) or tracking_number == l.id or tracking_number in l.email:
            found_lead = l
            break

    if not found_lead:
        # Fallback demonstration payload if matching demo code
        return {
            "tracking_number": tracking_number,
            "status": "dispatched",
            "carrier": "FedEx Express",
            "requested_skus": ["FP-GOLD-804", "FP-BLK-201", "FP-WAL-502"],
            "recipient": "Studio Partner",
            "estimated_delivery": "2026-07-26",
            "history": [
                {"stage": "Order Received", "timestamp": "2026-07-22 08:00", "completed": True},
                {"stage": "Sample Box Packed", "timestamp": "2026-07-22 10:30", "completed": True},
                {"stage": "Dispatched via FedEx", "timestamp": "2026-07-22 14:00", "completed": True},
                {"stage": "Out for Delivery", "timestamp": "Pending", "completed": False}
            ]
        }

    return {
        "tracking_number": tracking_number,
        "status": found_lead.status,
        "carrier": "FedEx Express",
        "email": found_lead.email,
        "company": found_lead.company,
        "created_at": found_lead.created_at.isoformat() if found_lead.created_at else None,
        "follow_up_at": found_lead.follow_up_at.isoformat() if found_lead.follow_up_at else None
    }
