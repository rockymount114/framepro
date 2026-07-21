from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from packages.database.repositories import CRMRepository
from packages.shared.schemas import LeadCreateRequest, LeadOut
from apps.api.app.dependencies import get_db

router = APIRouter(prefix="/crm", tags=["CRM"])

@router.post("/leads", response_model=LeadOut)
async def create_lead(req: LeadCreateRequest, session: AsyncSession = Depends(get_db)):
    repo = CRMRepository(session)
    lead = await repo.create_lead(email=req.email, source=req.source, phone=req.phone, company=req.company)
    return LeadOut(
        id=lead.id,
        email=lead.email,
        source=lead.source,
        status=lead.status,
        company=lead.company,
        created_at=lead.created_at
    )

@router.get("/leads", response_model=List[LeadOut])
async def list_leads(session: AsyncSession = Depends(get_db)):
    repo = CRMRepository(session)
    leads = await repo.list_leads()
    return [
        LeadOut(
            id=lead.id,
            email=lead.email,
            source=lead.source,
            status=lead.status,
            company=lead.company,
            created_at=lead.created_at
        )
        for lead in leads
    ]
