from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# Error envelope per API_SPEC.md
class ErrorDetail(BaseModel):
    code: str
    message: str
    field: Optional[str] = None

class ErrorResponse(BaseModel):
    error: ErrorDetail

# Auth Schemas
class UserRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = "consumer"

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: str

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    created_at: datetime

class DistributorApplyRequest(BaseModel):
    company_name: str
    tax_id: str
    wholesale_tier: str = "bronze"

# Product Schemas
class FrameProfileOut(BaseModel):
    id: str
    sku: str
    name: str
    material: str
    finish: str
    texture: str
    wood_grain: Optional[str] = None
    color: str
    width_mm: float
    depth_mm: float
    application: str
    weight_g_per_m: float
    moq: int
    container_qty: int
    retail_price_cents: int
    wholesale_price_cents: Optional[int] = None
    currency: str = "USD"
    model_3d_url: Optional[str] = None
    normal_map_url: Optional[str] = None
    pbr_texture_url: Optional[str] = None
    installation_guide_url: Optional[str] = None
    pdf_catalog_url: Optional[str] = None

    class Config:
        from_attributes = True

class ProductPricingOut(BaseModel):
    sku: str
    retail_price_cents: int
    wholesale_price_cents: Optional[int]
    currency: str
    moq: int

# AI Schemas
class AIFramePreviewRequest(BaseModel):
    frame_sku: str
    material: str = "walnut"
    width_mm: float = 50.0
    mat_board_cm: float = 5.0

class RoomPlacementItem(BaseModel):
    frame_sku: str
    width_cm: float = 60.0
    placement_x_pct: float = 0.5
    placement_y_pct: float = 0.35

class AIRoomVisualizerRequest(BaseModel):
    room_image_key: Optional[str] = None
    placements: List[RoomPlacementItem]

class AIJobStatusResponse(BaseModel):
    job_id: str
    status: str  # pending, processing, completed, failed
    result_url: Optional[str] = None
    error_message: Optional[str] = None

class AIRecommendRequest(BaseModel):
    image_style: str = "abstract"
    color_palette: Optional[List[str]] = None

class AIChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

# Quotation Schemas
class QuotationItemCreate(BaseModel):
    frame_sku: str
    quantity: int = Field(..., gt=0, description="Quantity in meters or pieces")

class QuotationCreateRequest(BaseModel):
    incoterm: str = Field("FOB", pattern="^(FOB|EXW|DDP)$")
    currency: str = "USD"
    items: List[QuotationItemCreate]

class QuotationItemOut(BaseModel):
    id: str
    frame_sku: str
    quantity: int
    unit_price_cents: int

class QuotationOut(BaseModel):
    id: str
    status: str
    incoterm: str
    currency: str
    subtotal_cents: int
    tax_cents: int
    shipping_cents: int
    discount_cents: int
    total_cents: int
    valid_until: datetime
    signed_at: Optional[datetime] = None
    items: List[QuotationItemOut]

class QuotationSignRequest(BaseModel):
    signature_data: str

# Order Schemas
class OrderItemCreate(BaseModel):
    frame_sku: str
    quantity: int

class OrderCreateRequest(BaseModel):
    quotation_id: Optional[str] = None
    incoterm: Optional[str] = "FOB"
    items: Optional[List[OrderItemCreate]] = None

class OrderOut(BaseModel):
    id: str
    status: str
    total_cents: int
    currency: str
    incoterm: Optional[str]
    created_at: datetime

# CRM Schemas
class LeadCreateRequest(BaseModel):
    email: EmailStr
    source: str = "contact_form"
    phone: Optional[str] = None
    company: Optional[str] = None

class LeadOut(BaseModel):
    id: str
    email: str
    source: str
    status: str
    company: Optional[str] = None
    created_at: datetime
