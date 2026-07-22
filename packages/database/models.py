import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import (
    String, Text, Integer, BigInteger, Numeric, DateTime, Date, Boolean, ForeignKey, JSON
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

def utc_now() -> datetime:
    return datetime.now(timezone.utc)

class Base(DeclarativeBase):
    pass

class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    key: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)  # e.g. "products:write", "crm:write"
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)

class RolePermission(Base):
    __tablename__ = "role_permissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    role: Mapped[str] = mapped_column(String(50), index=True, nullable=False)  # matches users.role
    permission_id: Mapped[str] = mapped_column(String(36), ForeignKey("permissions.id"), nullable=False, index=True)

class ProductViewDaily(Base):
    __tablename__ = "product_view_daily"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    frame_profile_id: Mapped[str] = mapped_column(String(36), ForeignKey("frame_profiles.id"), nullable=False, index=True)
    view_date: Mapped[datetime.date] = mapped_column(Date, nullable=False, index=True)
    view_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)  # e.g. "product.updated", "lead.status_changed"
    target_type: Mapped[str] = mapped_column(String(100), nullable=False)
    target_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    diff: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)

class User(Base):

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="consumer", nullable=False)  # consumer, designer, distributor, admin
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    ai_training_opt_in: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    distributor_profile: Mapped[Optional["DistributorProfile"]] = relationship("DistributorProfile", back_populates="user", uselist=False)
    orders: Mapped[List["Order"]] = relationship("Order", back_populates="user")
    ai_jobs: Mapped[List["AIJob"]] = relationship("AIJob", back_populates="user")

class DistributorProfile(Base):
    __tablename__ = "distributor_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    wholesale_tier: Mapped[str] = mapped_column(String(50), default="bronze")  # bronze, silver, gold
    tax_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user: Mapped["User"] = relationship("User", back_populates="distributor_profile")
    quotations: Mapped[List["Quotation"]] = relationship("Quotation", back_populates="distributor")

class FrameProfile(Base):
    __tablename__ = "frame_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    sku: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    material: Mapped[str] = mapped_column(String(100), nullable=False)
    finish: Mapped[str] = mapped_column(String(100), nullable=False)
    texture: Mapped[str] = mapped_column(String(100), nullable=False)
    wood_grain: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    color: Mapped[str] = mapped_column(String(100), nullable=False)
    width_mm: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    depth_mm: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    application: Mapped[str] = mapped_column(String(100), default="wall art")
    weight_g_per_m: Mapped[float] = mapped_column(Numeric(10, 2), default=300.0)
    moq: Mapped[int] = mapped_column(Integer, default=100)  # minimum order quantity in meters/pieces
    container_qty: Mapped[int] = mapped_column(Integer, default=5000)
    retail_price_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    wholesale_price_cents: Mapped[Optional[int]] = mapped_column(BigInteger, nullable=True)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    model_3d_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    normal_map_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pbr_texture_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    installation_guide_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    pdf_catalog_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    images: Mapped[List["FrameImage"]] = relationship("FrameImage", back_populates="frame_profile", cascade="all, delete-orphan")

class FrameImage(Base):
    __tablename__ = "frame_images"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    frame_profile_id: Mapped[str] = mapped_column(String(36), ForeignKey("frame_profiles.id"), nullable=False, index=True)
    url: Mapped[str] = mapped_column(Text, nullable=False)
    alt_text: Mapped[str] = mapped_column(String(255), default="")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    frame_profile: Mapped["FrameProfile"] = relationship("FrameProfile", back_populates="images")

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, confirmed, in_production, shipped, delivered, cancelled
    total_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    incoterm: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)  # FOB, EXW, DDP
    quotation_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("quotations.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="orders")
    items: Mapped[List["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    order_id: Mapped[str] = mapped_column(String(36), ForeignKey("orders.id"), nullable=False, index=True)
    frame_profile_id: Mapped[str] = mapped_column(String(36), ForeignKey("frame_profiles.id"), nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    frame_profile: Mapped["FrameProfile"] = relationship("FrameProfile")

class Quotation(Base):
    __tablename__ = "quotations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True, index=True)
    distributor_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("distributor_profiles.id"), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default="draft")  # draft, sent, signed, expired, cancelled
    incoterm: Mapped[str] = mapped_column(String(10), default="FOB")  # FOB, EXW, DDP
    currency: Mapped[str] = mapped_column(String(3), default="USD")
    subtotal_cents: Mapped[int] = mapped_column(BigInteger, default=0)
    tax_cents: Mapped[int] = mapped_column(BigInteger, default=0)
    shipping_cents: Mapped[int] = mapped_column(BigInteger, default=0)
    discount_cents: Mapped[int] = mapped_column(BigInteger, default=0)
    total_cents: Mapped[int] = mapped_column(BigInteger, default=0)
    valid_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    signed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    signature_data: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    distributor: Mapped[Optional["DistributorProfile"]] = relationship("DistributorProfile", back_populates="quotations")
    items: Mapped[List["QuotationItem"]] = relationship("QuotationItem", back_populates="quotation", cascade="all, delete-orphan")

class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quotation_id: Mapped[str] = mapped_column(String(36), ForeignKey("quotations.id"), nullable=False, index=True)
    frame_profile_id: Mapped[str] = mapped_column(String(36), ForeignKey("frame_profiles.id"), nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_price_cents: Mapped[int] = mapped_column(BigInteger, nullable=False)

    quotation: Mapped["Quotation"] = relationship("Quotation", back_populates="items")
    frame_profile: Mapped["FrameProfile"] = relationship("FrameProfile")

class AIJob(Base):
    __tablename__ = "ai_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    job_type: Mapped[str] = mapped_column(String(50), nullable=False)  # frame_preview, room_visualizer, recommendation
    status: Mapped[str] = mapped_column(String(50), default="pending", index=True)  # pending, processing, completed, failed
    input_payload: Mapped[dict] = mapped_column(JSON, default=dict)
    result_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    cost_cents: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    retention_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user: Mapped[Optional["User"]] = relationship("User", back_populates="ai_jobs")

class AIChatSession(Base):
    __tablename__ = "ai_chat_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    session_title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    messages: Mapped[List["AIChatMessage"]] = relationship("AIChatMessage", back_populates="session", cascade="all, delete-orphan", order_by="AIChatMessage.created_at")
    user: Mapped[Optional["User"]] = relationship("User")

class AIChatMessage(Base):
    __tablename__ = "ai_chat_messages"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("ai_chat_sessions.id"), nullable=False, index=True)
    sender: Mapped[str] = mapped_column(String(20), nullable=False)  # "user" or "assistant"
    content: Mapped[str] = mapped_column(Text, nullable=False)
    suggested_skus: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, index=True)

    session: Mapped["AIChatSession"] = relationship("AIChatSession", back_populates="messages")

class Warehouse(Base):
    __tablename__ = "warehouses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    region: Mapped[str] = mapped_column(String(100), nullable=False)

class InventoryLevel(Base):
    __tablename__ = "inventory_levels"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    warehouse_id: Mapped[str] = mapped_column(String(36), ForeignKey("warehouses.id"), nullable=False, index=True)
    frame_profile_id: Mapped[str] = mapped_column(String(36), ForeignKey("frame_profiles.id"), nullable=False, index=True)
    quantity_on_hand: Mapped[int] = mapped_column(Integer, default=0)
    quantity_reserved: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source: Mapped[str] = mapped_column(String(100), default="contact_form")
    status: Mapped[str] = mapped_column(String(50), default="new")  # new, contacted, qualified, won, lost
    owner_user_id: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    tags: Mapped[dict] = mapped_column(JSON, default=list)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    company: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    follow_up_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

