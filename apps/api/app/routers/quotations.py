from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from packages.database.repositories import QuotationRepository, FrameProfileRepository
from packages.database.models import Quotation, QuotationItem
from packages.shared.schemas import (
    QuotationCreateRequest, QuotationOut, QuotationItemOut, QuotationSignRequest
)
from apps.api.app.services.quotation_service import QuotationCalculator, MOQViolationError
from apps.api.app.dependencies import get_db, get_current_user

router = APIRouter(prefix="/quotations", tags=["Quotations"])

@router.post("", response_model=QuotationOut)
async def create_quotation(
    req: QuotationCreateRequest,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    frame_repo = FrameProfileRepository(session)
    quote_repo = QuotationRepository(session)

    items_data = []
    for item_req in req.items:
        frame = await frame_repo.get_by_sku(item_req.frame_sku)
        if not frame:
            raise HTTPException(status_code=404, detail=f"Frame SKU '{item_req.frame_sku}' not found")
        items_data.append({"frame_profile": frame, "quantity": item_req.quantity})

    try:
        calc_result = QuotationCalculator.calculate_quotation(
            items_data=items_data,
            incoterm=req.incoterm,
            wholesale_tier="silver"
        )
    except MOQViolationError as e:
        raise HTTPException(
            status_code=400,
            detail={"code": "MOQ_VIOLATION", "message": str(e), "field": "quantity"}
        )

    valid_until = datetime.now(timezone.utc) + timedelta(days=30)
    quotation = Quotation(
        status="draft",
        incoterm=req.incoterm,
        currency=req.currency,
        subtotal_cents=calc_result["subtotal_cents"],
        discount_cents=calc_result["discount_cents"],
        tax_cents=calc_result["tax_cents"],
        shipping_cents=calc_result["shipping_cents"],
        total_cents=calc_result["total_cents"],
        valid_until=valid_until
    )

    db_items = [
        QuotationItem(
            frame_profile_id=item["frame_profile"].id,
            quantity=item["quantity"],
            unit_price_cents=item["unit_price_cents"]
        )
        for item in calc_result["items"]
    ]

    saved_quote = await quote_repo.create(quotation, db_items)

    out_items = [
        QuotationItemOut(
            id=item.id,
            frame_sku=frame_data["frame_profile"].sku,
            quantity=item.quantity,
            unit_price_cents=item.unit_price_cents
        )
        for item, frame_data in zip(saved_quote.items, calc_result["items"])
    ]

    return QuotationOut(
        id=saved_quote.id,
        status=saved_quote.status,
        incoterm=saved_quote.incoterm,
        currency=saved_quote.currency,
        subtotal_cents=saved_quote.subtotal_cents,
        tax_cents=saved_quote.tax_cents,
        shipping_cents=saved_quote.shipping_cents,
        discount_cents=saved_quote.discount_cents,
        total_cents=saved_quote.total_cents,
        valid_until=saved_quote.valid_until,
        items=out_items
    )

@router.get("/{id}", response_model=QuotationOut)
async def get_quotation(id: str, session: AsyncSession = Depends(get_db)):
    quote_repo = QuotationRepository(session)
    quote = await quote_repo.get_by_id(id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")
    
    out_items = [
        QuotationItemOut(
            id=item.id,
            frame_sku=item.frame_profile.sku if item.frame_profile else "FP-2201-WAL",
            quantity=item.quantity,
            unit_price_cents=item.unit_price_cents
        )
        for item in quote.items
    ]
    return QuotationOut(
        id=quote.id,
        status=quote.status,
        incoterm=quote.incoterm,
        currency=quote.currency,
        subtotal_cents=quote.subtotal_cents,
        tax_cents=quote.tax_cents,
        shipping_cents=quote.shipping_cents,
        discount_cents=quote.discount_cents,
        total_cents=quote.total_cents,
        valid_until=quote.valid_until,
        signed_at=quote.signed_at,
        items=out_items
    )

@router.post("/{id}/pdf")
async def download_quotation_pdf(id: str, session: AsyncSession = Depends(get_db)):
    quote_repo = QuotationRepository(session)
    quote = await quote_repo.get_by_id(id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")

    items_data = [
        {
            "frame_profile": item.frame_profile,
            "quantity": item.quantity,
            "unit_price_cents": item.unit_price_cents,
            "line_total_cents": item.unit_price_cents * item.quantity
        }
        for item in quote.items
    ]
    quote_dict = {
        "incoterm": quote.incoterm,
        "subtotal_cents": quote.subtotal_cents,
        "discount_cents": quote.discount_cents,
        "tax_cents": quote.tax_cents,
        "total_cents": quote.total_cents,
        "items": items_data
    }
    
    pdf_bytes = QuotationCalculator.generate_pdf_quotation(quote_dict, quote.id)
    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=quotation_{quote.id[:8]}.pdf"})

@router.post("/{id}/sign", response_model=QuotationOut)
async def sign_quotation(
    id: str,
    req: QuotationSignRequest,
    session: AsyncSession = Depends(get_db)
):
    quote_repo = QuotationRepository(session)
    quote = await quote_repo.get_by_id(id)
    if not quote:
        raise HTTPException(status_code=404, detail="Quotation not found")

    quote.status = "signed"
    quote.signed_at = datetime.now(timezone.utc)
    quote.signature_data = req.signature_data
    await session.flush()

    out_items = [
        QuotationItemOut(
            id=item.id,
            frame_sku=item.frame_profile.sku if item.frame_profile else "FP-2201-WAL",
            quantity=item.quantity,
            unit_price_cents=item.unit_price_cents
        )
        for item in quote.items
    ]
    return QuotationOut(
        id=quote.id,
        status=quote.status,
        incoterm=quote.incoterm,
        currency=quote.currency,
        subtotal_cents=quote.subtotal_cents,
        tax_cents=quote.tax_cents,
        shipping_cents=quote.shipping_cents,
        discount_cents=quote.discount_cents,
        total_cents=quote.total_cents,
        valid_until=quote.valid_until,
        signed_at=quote.signed_at,
        items=out_items
    )
