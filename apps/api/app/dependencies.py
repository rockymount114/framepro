from typing import Optional, AsyncGenerator, Callable
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from packages.database.connection import get_db_session
from packages.database.repositories import UserRepository
from packages.database.models import User, Permission, RolePermission
from packages.config.settings import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/login", auto_error=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_db_session():
        yield session

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
    session: AsyncSession = Depends(get_db)
) -> User:
    """
    Returns current authenticated user.
    Supports Admin API Key, admin_token, or demo_token fallback.
    """
    user_repo = UserRepository(session)
    
    # 1. Check X-Admin-Key header or token == "admin_token"
    if x_admin_key == settings.ADMIN_API_KEY or token == "admin_token":
        user = await user_repo.get_by_email(settings.ADMIN_DEFAULT_EMAIL)
        if not user:
            user = await user_repo.create(
                email=settings.ADMIN_DEFAULT_EMAIL,
                full_name="System Admin",
                role="admin"
            )
        else:
            if user.role != "admin":
                user.role = "admin"
                await session.commit()
        return user

    # 2. Default fallback demo user if unauthenticated or demo_token
    user = await user_repo.get_by_email("demo@framepro.com")
    if not user:
        user = await user_repo.create(email="demo@framepro.com", full_name="Demo User", role="distributor")
    return user

def require_permission(permission_key: str) -> Callable:
    """
    FastAPI dependency enforcing RBAC permission or admin role check.
    """
    async def dependency(
        user: User = Depends(get_current_user),
        session: AsyncSession = Depends(get_db)
    ) -> User:
        # Admin superuser bypasses fine-grained checks
        if user.role == "admin":
            return user
        
        # Query role permissions
        query = (
            select(Permission.key)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .where(RolePermission.role == user.role, Permission.key == permission_key)
        )
        res = await session.execute(query)
        has_perm = res.scalar_one_or_none()
        
        if not has_perm:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"code": "FORBIDDEN", "message": f"Permission '{permission_key}' required"}
            )
        return user

    return dependency
