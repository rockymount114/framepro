import csv
import io
import uuid
from datetime import datetime, date, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy import select, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from packages.database.models import (
    FrameProfile, FrameImage, Lead, ProductViewDaily, AdminAuditLog, Permission, RolePermission, User
)

class AdminService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def log_action(
        self,
        actor_user_id: str,
        action: str,
        target_type: str,
        target_id: Optional[str] = None,
        diff: Optional[Dict[str, Any]] = None
    ) -> AdminAuditLog:
        audit_log = AdminAuditLog(
            id=str(uuid.uuid4()),
            actor_user_id=actor_user_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            diff=diff,
            created_at=datetime.now(timezone.utc)
        )
        self.session.add(audit_log)
        await self.session.commit()
        return audit_log

    # --- Product Management ---
    async def list_admin_products(
        self,
        limit: int = 50,
        offset: int = 0,
        material: Optional[str] = None
    ) -> List[FrameProfile]:
        query = select(FrameProfile)
        if material:
            query = query.where(FrameProfile.material == material)
        query = query.order_by(FrameProfile.created_at.desc()).offset(offset).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def create_product(self, actor_user_id: str, data: Dict[str, Any]) -> FrameProfile:
        sku = data.get("sku")
        if not sku:
            raise ValueError("SKU is required")
        
        # Check duplicate
        existing = await self.session.execute(select(FrameProfile).where(FrameProfile.sku == sku))
        if existing.scalar_one_or_none():
            raise ValueError(f"Product with SKU '{sku}' already exists")

        profile = FrameProfile(
            id=str(uuid.uuid4()),
            sku=sku,
            name=data.get("name", "Untitled Frame"),
            material=data.get("material", "PS Composite"),
            finish=data.get("finish", "Matte"),
            texture=data.get("texture", "Smooth"),
            wood_grain=data.get("wood_grain"),
            color=data.get("color", "Black"),
            width_mm=float(data.get("width_mm", 30.0)),
            depth_mm=float(data.get("depth_mm", 20.0)),
            moq=int(data.get("moq", 100)),
            container_qty=int(data.get("container_qty", 5000)),
            retail_price_cents=int(data.get("retail_price_cents", 1500)),
            wholesale_price_cents=int(data.get("wholesale_price_cents", 800)),
            currency=data.get("currency", "USD")
        )
        self.session.add(profile)
        await self.session.commit()

        await self.log_action(
            actor_user_id=actor_user_id,
            action="product.created",
            target_type="frame_profiles",
            target_id=profile.id,
            diff={"sku": profile.sku, "name": profile.name}
        )
        return profile

    async def update_product(self, actor_user_id: str, sku: str, data: Dict[str, Any]) -> FrameProfile:
        res = await self.session.execute(select(FrameProfile).where(FrameProfile.sku == sku))
        profile = res.scalar_one_or_none()
        if not profile:
            raise ValueError(f"Product with SKU '{sku}' not found")

        diff = {}
        for k, v in data.items():
            if hasattr(profile, k) and getattr(profile, k) != v:
                diff[k] = {"old": getattr(profile, k), "new": v}
                setattr(profile, k, v)

        await self.session.commit()
        await self.log_action(
            actor_user_id=actor_user_id,
            action="product.updated",
            target_type="frame_profiles",
            target_id=profile.id,
            diff=diff
        )
        return profile

    async def delete_product(self, actor_user_id: str, sku: str) -> bool:
        res = await self.session.execute(select(FrameProfile).where(FrameProfile.sku == sku))
        profile = res.scalar_one_or_none()
        if not profile:
            return False

        await self.session.delete(profile)
        await self.session.commit()

        await self.log_action(
            actor_user_id=actor_user_id,
            action="product.deleted",
            target_type="frame_profiles",
            target_id=profile.id,
            diff={"sku": sku}
        )
        return True

    async def preview_csv_import(self, csv_content: str) -> Dict[str, Any]:
        reader = csv.DictReader(io.StringIO(csv_content))
        creates, updates, errors = [], [], []

        for idx, row in enumerate(reader, start=2):
            sku = row.get("sku")
            if not sku:
                errors.append({"line": idx, "error": "Missing SKU"})
                continue

            res = await self.session.execute(select(FrameProfile).where(FrameProfile.sku == sku))
            existing = res.scalar_one_or_none()

            item = {
                "sku": sku,
                "name": row.get("name", "Imported Frame"),
                "material": row.get("material", "PS"),
                "finish": row.get("finish", "Standard"),
                "color": row.get("color", "Black"),
                "retail_price_cents": int(row.get("retail_price_cents", 1000))
            }
            if existing:
                updates.append(item)
            else:
                creates.append(item)

        return {
            "summary": {
                "total_rows": len(creates) + len(updates) + len(errors),
                "creates_count": len(creates),
                "updates_count": len(updates),
                "errors_count": len(errors)
            },
            "creates": creates,
            "updates": updates,
            "errors": errors
        }

    async def commit_csv_import(self, actor_user_id: str, items: List[Dict[str, Any]]) -> int:
        committed = 0
        for item in items:
            sku = item.get("sku")
            if not sku:
                continue
            res = await self.session.execute(select(FrameProfile).where(FrameProfile.sku == sku))
            existing = res.scalar_one_or_none()

            if existing:
                for k, v in item.items():
                    if hasattr(existing, k):
                        setattr(existing, k, v)
            else:
                profile = FrameProfile(
                    id=str(uuid.uuid4()),
                    sku=sku,
                    name=item.get("name", "Imported Frame"),
                    material=item.get("material", "PS"),
                    finish=item.get("finish", "Standard"),
                    texture=item.get("texture", "Smooth"),
                    color=item.get("color", "Black"),
                    width_mm=float(item.get("width_mm", 30.0)),
                    depth_mm=float(item.get("depth_mm", 20.0)),
                    retail_price_cents=int(item.get("retail_price_cents", 1500)),
                    wholesale_price_cents=int(item.get("wholesale_price_cents", 800))
                )
                self.session.add(profile)
            committed += 1

        await self.session.commit()
        await self.log_action(
            actor_user_id=actor_user_id,
            action="product.bulk_import",
            target_type="frame_profiles",
            diff={"committed_count": committed}
        )
        return committed

    async def export_csv(self) -> str:
        res = await self.session.execute(select(FrameProfile))
        profiles = res.scalars().all()
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["sku", "name", "material", "finish", "color", "width_mm", "depth_mm", "moq", "retail_price_cents", "wholesale_price_cents"])
        for p in profiles:
            writer.writerow([p.sku, p.name, p.material, p.finish, p.color, p.width_mm, p.depth_mm, p.moq, p.retail_price_cents, p.wholesale_price_cents])
        return output.getvalue()

    # --- CRM Management ---
    async def list_leads(self, status_filter: Optional[str] = None) -> List[Lead]:
        query = select(Lead)
        if status_filter:
            query = query.where(Lead.status == status_filter)
        query = query.order_by(Lead.created_at.desc())
        res = await self.session.execute(query)
        return list(res.scalars().all())

    async def update_lead(self, actor_user_id: str, lead_id: str, data: Dict[str, Any]) -> Lead:
        res = await self.session.execute(select(Lead).where(Lead.id == lead_id))
        lead = res.scalar_one_or_none()
        if not lead:
            raise ValueError(f"Lead '{lead_id}' not found")

        diff = {}
        for k, v in data.items():
            if hasattr(lead, k) and getattr(lead, k) != v:
                diff[k] = {"old": getattr(lead, k), "new": v}
                setattr(lead, k, v)

        await self.session.commit()
        await self.log_action(
            actor_user_id=actor_user_id,
            action="crm.lead_updated",
            target_type="leads",
            target_id=lead_id,
            diff=diff
        )
        return lead

    # --- Product View Analytics Rollup ---
    async def record_product_view(self, sku: str) -> None:
        res = await self.session.execute(select(FrameProfile).where(FrameProfile.sku == sku))
        profile = res.scalar_one_or_none()
        if not profile:
            return

        today = date.today()
        view_res = await self.session.execute(
            select(ProductViewDaily).where(
                ProductViewDaily.frame_profile_id == profile.id,
                ProductViewDaily.view_date == today
            )
        )
        daily_record = view_res.scalar_one_or_none()
        if daily_record:
            daily_record.view_count += 1
        else:
            daily_record = ProductViewDaily(
                id=str(uuid.uuid4()),
                frame_profile_id=profile.id,
                view_date=today,
                view_count=1
            )
            self.session.add(daily_record)
        await self.session.commit()

    async def get_top_products(self, range_key: str = "week") -> List[Dict[str, Any]]:
        res = await self.session.execute(
            select(
                FrameProfile.sku,
                FrameProfile.name,
                FrameProfile.material,
                func.sum(ProductViewDaily.view_count).label("total_views")
            )
            .join(ProductViewDaily, ProductViewDaily.frame_profile_id == FrameProfile.id)
            .group_by(FrameProfile.id)
            .order_by(func.sum(ProductViewDaily.view_count).desc())
            .limit(20)
        )
        return [
            {
                "sku": row.sku,
                "name": row.name,
                "material": row.material,
                "total_views": row.total_views or 0
            }
            for row in res.all()
        ]

    # --- Audit Logs ---
    async def get_audit_logs(self, limit: int = 100) -> List[AdminAuditLog]:
        res = await self.session.execute(
            select(AdminAuditLog).order_by(AdminAuditLog.created_at.desc()).limit(limit)
        )
        return list(res.scalars().all())

    # --- Permissions & Roles ---
    async def get_permissions(self) -> Dict[str, Any]:
        perms = await self.session.execute(select(Permission))
        roles = await self.session.execute(select(RolePermission))
        return {
            "permissions": [{"id": p.id, "key": p.key, "description": p.description} for p in perms.scalars().all()],
            "role_permissions": [{"id": r.id, "role": r.role, "permission_id": r.permission_id} for r in roles.scalars().all()]
        }
