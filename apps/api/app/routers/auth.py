from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from packages.database.repositories import UserRepository
from packages.shared.schemas import UserRegisterRequest, UserLoginRequest, TokenResponse, UserOut, DistributorApplyRequest
from apps.api.app.dependencies import get_db, get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserOut)
async def register(req: UserRegisterRequest, session: AsyncSession = Depends(get_db)):
    repo = UserRepository(session)
    existing = await repo.get_by_email(req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await repo.create(email=req.email, full_name=req.full_name, role=req.role)
    return user

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLoginRequest, session: AsyncSession = Depends(get_db)):
    repo = UserRepository(session)
    user = await repo.get_by_email(req.email)
    if not user:
        # Auto-create for demo/testing convenience
        is_admin = "admin" in req.email.lower()
        role = "admin" if is_admin else "distributor"
        full_name = "System Admin" if is_admin else "Valued User"
        user = await repo.create(email=req.email, full_name=full_name, role=role)
    return TokenResponse(access_token=f"jwt_{user.id}", user_id=user.id, role=user.role)

@router.get("/me", response_model=UserOut)
async def me(current_user = Depends(get_current_user)):
    return current_user

@router.post("/distributor/apply")
async def apply_distributor(req: DistributorApplyRequest, current_user = Depends(get_current_user)):
    return {"status": "submitted", "message": "Distributor application under review", "tier": req.wholesale_tier}
