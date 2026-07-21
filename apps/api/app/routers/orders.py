from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from packages.database.repositories import OrderRepository, QuotationRepository, FrameProfileRepository
from packages.database.models import Order, OrderItem
from packages.shared.schemas import OrderCreateRequest, OrderOut
from apps.api.app.dependencies import get_db, get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=OrderOut)
async def create_order(
    req: OrderCreateRequest,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    order_repo = OrderRepository(session)
    frame_repo = FrameProfileRepository(session)

    if req.quotation_id:
        quote_repo = QuotationRepository(session)
        quote = await quote_repo.get_by_id(req.quotation_id)
        if not quote:
            raise HTTPException(status_code=404, detail="Referenced quotation not found")
        order = Order(
            user_id=user.id,
            status="confirmed",
            total_cents=quote.total_cents,
            currency=quote.currency,
            incoterm=quote.incoterm,
            quotation_id=quote.id
        )
        items = [
            OrderItem(frame_profile_id=it.frame_profile_id, quantity=it.quantity, unit_price_cents=it.unit_price_cents)
            for it in quote.items
        ]
    else:
        if not req.items:
            raise HTTPException(status_code=400, detail="Order items required")
        total_cents = 0
        items = []
        for item_req in req.items:
            frame = await frame_repo.get_by_sku(item_req.frame_sku)
            if not frame:
                raise HTTPException(status_code=404, detail=f"SKU {item_req.frame_sku} not found")
            price = frame.wholesale_price_cents if frame.wholesale_price_cents else frame.retail_price_cents
            line_total = price * item_req.quantity
            total_cents += line_total
            items.append(OrderItem(frame_profile_id=frame.id, quantity=item_req.quantity, unit_price_cents=price))

        order = Order(
            user_id=user.id,
            status="pending",
            total_cents=total_cents,
            currency="USD",
            incoterm=req.incoterm
        )

    saved_order = await order_repo.create(order, items)
    return OrderOut(
        id=saved_order.id,
        status=saved_order.status,
        total_cents=saved_order.total_cents,
        currency=saved_order.currency,
        incoterm=saved_order.incoterm,
        created_at=saved_order.created_at
    )

@router.get("/{id}", response_model=OrderOut)
async def get_order(id: str, session: AsyncSession = Depends(get_db)):
    order_repo = OrderRepository(session)
    order = await order_repo.get_by_id(id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderOut(
        id=order.id,
        status=order.status,
        total_cents=order.total_cents,
        currency=order.currency,
        incoterm=order.incoterm,
        created_at=order.created_at
    )
