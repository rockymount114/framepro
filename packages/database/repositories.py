from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from packages.database.models import (
    User, DistributorProfile, FrameProfile, Order, OrderItem,
    Quotation, QuotationItem, AIJob, Warehouse, InventoryLevel, Lead
)

class BaseRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

class UserRepository(BaseRepository):
    async def create(self, email: str, full_name: str, password_hash: Optional[str] = None, role: str = "consumer") -> User:
        user = User(email=email, full_name=full_name, password_hash=password_hash, role=role)
        self.session.add(user)
        await self.session.flush()
        return user

    async def get_by_id(self, user_id: str) -> Optional[User]:
        stmt = select(User).where(User.id == user_id, User.deleted_at == None)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email, User.deleted_at == None)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_users(
        self,
        role: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[User]:
        stmt = select(User).where(User.deleted_at == None)
        if role:
            stmt = stmt.where(User.role == role)
        if search:
            pattern = f"%{search}%"
            stmt = stmt.where((User.email.ilike(pattern)) | (User.full_name.ilike(pattern)))
        stmt = stmt.order_by(User.created_at.desc()).offset(offset).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def update_user(self, user_id: str, **kwargs: Any) -> Optional[User]:
        user = await self.get_by_id(user_id)
        if not user:
            return None
        for k, v in kwargs.items():
            if hasattr(user, k) and v is not None:
                setattr(user, k, v)
        await self.session.flush()
        return user

    async def soft_delete(self, user_id: str) -> bool:
        from packages.database.models import utc_now
        user = await self.get_by_id(user_id)
        if not user:
            return False
        user.deleted_at = utc_now()
        await self.session.flush()
        return True

class FrameProfileRepository(BaseRepository):
    async def create(self, **data: Any) -> FrameProfile:
        frame = FrameProfile(**data)
        self.session.add(frame)
        await self.session.flush()
        return frame

    async def get_by_sku(self, sku: str) -> Optional[FrameProfile]:
        stmt = select(FrameProfile).where(FrameProfile.sku == sku)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_all(
        self,
        material: Optional[str] = None,
        finish: Optional[str] = None,
        color: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[FrameProfile]:
        stmt = select(FrameProfile)
        if material:
            stmt = stmt.where(FrameProfile.material == material)
        if finish:
            stmt = stmt.where(FrameProfile.finish == finish)
        if color:
            stmt = stmt.where(FrameProfile.color == color)
        stmt = stmt.limit(limit).offset(offset)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

class QuotationRepository(BaseRepository):
    async def create(self, quotation: Quotation, items: List[QuotationItem]) -> Quotation:
        self.session.add(quotation)
        await self.session.flush()
        for item in items:
            item.quotation_id = quotation.id
            self.session.add(item)
        await self.session.flush()
        return quotation

    async def get_by_id(self, quotation_id: str) -> Optional[Quotation]:
        stmt = select(Quotation).where(Quotation.id == quotation_id, Quotation.deleted_at == None)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

class OrderRepository(BaseRepository):
    async def create(self, order: Order, items: List[OrderItem]) -> Order:
        self.session.add(order)
        await self.session.flush()
        for item in items:
            item.order_id = order.id
            self.session.add(item)
        await self.session.flush()
        return order

    async def get_by_id(self, order_id: str) -> Optional[Order]:
        stmt = select(Order).where(Order.id == order_id, Order.deleted_at == None)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

class AIJobRepository(BaseRepository):
    async def create(self, job_type: str, input_payload: Dict[str, Any], user_id: Optional[str] = None) -> AIJob:
        job = AIJob(job_type=job_type, input_payload=input_payload, user_id=user_id, status="pending")
        self.session.add(job)
        await self.session.flush()
        return job

    async def get_by_id(self, job_id: str) -> Optional[AIJob]:
        stmt = select(AIJob).where(AIJob.id == job_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update_status(self, job_id: str, status: str, result_url: Optional[str] = None, error_message: Optional[str] = None) -> Optional[AIJob]:
        job = await self.get_by_id(job_id)
        if job:
            job.status = status
            if result_url:
                job.result_url = result_url
            if error_message:
                job.error_message = error_message
            await self.session.flush()
        return job

class CRMRepository(BaseRepository):
    async def create_lead(self, email: str, source: str = "contact_form", phone: Optional[str] = None, company: Optional[str] = None) -> Lead:
        lead = Lead(email=email, source=source, phone=phone, company=company)
        self.session.add(lead)
        await self.session.flush()
        return lead

    async def list_leads(self) -> List[Lead]:
        stmt = select(Lead).order_by(Lead.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
