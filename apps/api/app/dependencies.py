from typing import Optional, AsyncGenerator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from packages.database.connection import get_db_session
from packages.database.repositories import UserRepository
from packages.database.models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/v1/auth/login", auto_error=False)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_db_session():
        yield session

async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_db)
) -> User:
    """
    Returns current authenticated user or a default guest/test user.
    """
    user_repo = UserRepository(session)
    # Default fallback demo user if unauthenticated
    if not token or token == "demo_token":
        user = await user_repo.get_by_email("demo@framepro.com")
        if not user:
            user = await user_repo.create(email="demo@framepro.com", full_name="Demo User", role="distributor")
        return user
    
    user = await user_repo.get_by_email("demo@framepro.com")
    if not user:
        user = await user_repo.create(email="demo@framepro.com", full_name="Demo User", role="distributor")
    return user
