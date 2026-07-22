from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from apps.api.app.dependencies import get_db, get_current_user, require_permission
from apps.api.app.services.admin_service import AdminService
from packages.database.models import User

router = APIRouter(prefix="/admin", tags=["Admin Panel"])

class ProductCreatePayload(BaseModel):
    sku: str
    name: str
    material: str = "PS Composite"
    finish: str = "Matte"
    texture: str = "Smooth"
    wood_grain: Optional[str] = None
    color: str = "Black"
    width_mm: float = 30.0
    depth_mm: float = 20.0
    moq: int = 100
    container_qty: int = 5000
    retail_price_cents: int = 1500
    wholesale_price_cents: int = 800
    currency: str = "USD"

class ProductUpdatePayload(BaseModel):
    name: Optional[str] = None
    material: Optional[str] = None
    finish: Optional[str] = None
    color: Optional[str] = None
    width_mm: Optional[float] = None
    depth_mm: Optional[float] = None
    moq: Optional[int] = None
    retail_price_cents: Optional[int] = None
    wholesale_price_cents: Optional[int] = None

class LeadUpdatePayload(BaseModel):
    status: Optional[str] = None
    company: Optional[str] = None
    follow_up_at: Optional[str] = None
    tags: Optional[List[str]] = None

class CSVCommitPayload(BaseModel):
    items: List[Dict[str, Any]]

# --- Product Management ---
@router.get("/products", dependencies=[Depends(require_permission("products:read"))])
async def list_admin_products(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    material: Optional[str] = None,
    session: AsyncSession = Depends(get_db)
):
    srv = AdminService(session)
    products = await srv.list_admin_products(limit=limit, offset=offset, material=material)
    return {
        "items": [
            {
                "id": p.id,
                "sku": p.sku,
                "name": p.name,
                "material": p.material,
                "finish": p.finish,
                "color": p.color,
                "width_mm": p.width_mm,
                "depth_mm": p.depth_mm,
                "moq": p.moq,
                "container_qty": p.container_qty,
                "retail_price_cents": p.retail_price_cents,
                "wholesale_price_cents": p.wholesale_price_cents,
                "currency": p.currency,
                "created_at": p.created_at.isoformat() if p.created_at else None
            }
            for p in products
        ]
    }

@router.post("/products", dependencies=[Depends(require_permission("products:write"))])
async def create_product(
    payload: ProductCreatePayload,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    srv = AdminService(session)
    try:
        profile = await srv.create_product(actor_user_id=current_user.id, data=payload.model_dump())
        return {"status": "success", "id": profile.id, "sku": profile.sku}
    except ValueError as e:
        raise HTTPException(status_code=400, detail={"code": "BAD_REQUEST", "message": str(e)})

@router.patch("/products/{sku}", dependencies=[Depends(require_permission("products:write"))])
async def update_product(
    sku: str,
    payload: ProductUpdatePayload,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    srv = AdminService(session)
    try:
        profile = await srv.update_product(
            actor_user_id=current_user.id,
            sku=sku,
            data={k: v for k, v in payload.model_dump().items() if v is not None}
        )
        return {"status": "updated", "sku": profile.sku}
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": str(e)})

@router.delete("/products/{sku}", dependencies=[Depends(require_permission("products:write"))])
async def delete_product(
    sku: str,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    srv = AdminService(session)
    deleted = await srv.delete_product(actor_user_id=current_user.id, sku=sku)
    if not deleted:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": f"SKU '{sku}' not found"})
    return {"status": "deleted", "sku": sku}

@router.post("/products/import/preview", dependencies=[Depends(require_permission("products:write"))])
async def preview_csv_import(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_db)
):
    content = (await file.read()).decode("utf-8")
    srv = AdminService(session)
    return await srv.preview_csv_import(content)

@router.post("/products/import/commit", dependencies=[Depends(require_permission("products:write"))])
async def commit_csv_import(
    payload: CSVCommitPayload,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    srv = AdminService(session)
    committed = await srv.commit_csv_import(actor_user_id=current_user.id, items=payload.items)
    return {"status": "success", "committed_count": committed}

@router.get("/products/export", dependencies=[Depends(require_permission("products:read"))])
async def export_products_csv(session: AsyncSession = Depends(get_db)):
    srv = AdminService(session)
    csv_str = await srv.export_csv()
    return PlainTextResponse(content=csv_str, media_type="text/csv", headers={"Content-Disposition": 'attachment; filename="framepro_catalog.csv"'})

# --- CRM Module ---
@router.get("/crm/leads", dependencies=[Depends(require_permission("crm:read"))])
async def list_leads(
    status: Optional[str] = None,
    session: AsyncSession = Depends(get_db)
):
    srv = AdminService(session)
    leads = await srv.list_leads(status_filter=status)
    return {
        "items": [
            {
                "id": l.id,
                "email": l.email,
                "company": l.company,
                "phone": l.phone,
                "status": l.status,
                "source": l.source,
                "tags": l.tags,
                "follow_up_at": l.follow_up_at.isoformat() if l.follow_up_at else None,
                "created_at": l.created_at.isoformat() if l.created_at else None
            }
            for l in leads
        ]
    }

@router.patch("/crm/leads/{id}", dependencies=[Depends(require_permission("crm:write"))])
async def update_lead(
    id: str,
    payload: LeadUpdatePayload,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db)
):
    srv = AdminService(session)
    try:
        lead = await srv.update_lead(
            actor_user_id=current_user.id,
            lead_id=id,
            data={k: v for k, v in payload.model_dump().items() if v is not None}
        )
        return {"status": "updated", "id": lead.id, "lead_status": lead.status}
    except ValueError as e:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": str(e)})

# --- Analytics ---
@router.post("/analytics/views/{sku}")
async def record_product_view(sku: str, session: AsyncSession = Depends(get_db)):
    srv = AdminService(session)
    await srv.record_product_view(sku)
    return {"status": "recorded", "sku": sku}

@router.get("/analytics/products/top", dependencies=[Depends(require_permission("analytics:read"))])
async def get_top_products(
    range: str = Query("week", alias="range"),
    session: AsyncSession = Depends(get_db)
):
    srv = AdminService(session)
    top_items = await srv.get_top_products(range_key=range)
    return {"range": range, "items": top_items}

# --- Audit Logs ---
@router.get("/audit-logs", dependencies=[Depends(require_permission("audit:read"))])
async def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    session: AsyncSession = Depends(get_db)
):
    srv = AdminService(session)
    logs = await srv.get_audit_logs(limit=limit)
    return {
        "items": [
            {
                "id": log.id,
                "actor_user_id": log.actor_user_id,
                "action": log.action,
                "target_type": log.target_type,
                "target_id": log.target_id,
                "diff": log.diff,
                "created_at": log.created_at.isoformat() if log.created_at else None
            }
            for log in logs
        ]
    }

# --- Permissions ---
@router.get("/permissions", dependencies=[Depends(require_permission("roles:read"))])
async def get_permissions(session: AsyncSession = Depends(get_db)):
    srv = AdminService(session)
    return await srv.get_permissions()
