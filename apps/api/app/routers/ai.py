import base64
import io
from PIL import Image
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from packages.database.repositories import AIJobRepository, FrameProfileRepository, AIChatRepository
from packages.shared.schemas import (
    AIFramePreviewRequest, AIRoomVisualizerRequest, AIJobStatusResponse,
    AIRecommendRequest, AIChatRequest, AIChatResponse
)
from packages.config.settings import settings
from packages.ai.compositor import FrameCompositor
from packages.ai.wall_detection import RoomWallDetector
from packages.ai.recommender import AIFrameRecommender
from packages.ai.llm import LLMAssistant
from apps.api.app.dependencies import get_db, get_current_user

router = APIRouter(prefix="/ai", tags=["AI Pipeline"])

@router.post("/frame-preview", response_model=AIJobStatusResponse)
async def submit_frame_preview(
    req: AIFramePreviewRequest,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    ai_repo = AIJobRepository(session)
    job = await ai_repo.create(
        job_type="frame_preview",
        input_payload=req.model_dump(),
        user_id=user.id
    )
    
    # Process synchronously for instant UI preview response
    try:
        # Create valid base artwork image
        art = Image.new("RGB", (400, 400), (220, 210, 195))
        buf = io.BytesIO()
        art.save(buf, format="JPEG")
        dummy_art = buf.getvalue()
        
        preview_bytes = FrameCompositor.render_framed_artwork(
            artwork_image_bytes=dummy_art,
            frame_sku=req.frame_sku,
            material=req.material,
            width_mm=req.width_mm,
            mat_board_cm=req.mat_board_cm
        )
        b64_data = base64.b64encode(preview_bytes).decode("utf-8")
        result_url = f"data:image/jpeg;base64,{b64_data}"
        
        await ai_repo.update_status(job.id, status="completed", result_url=result_url)
        return AIJobStatusResponse(job_id=job.id, status="completed", result_url=result_url)
    except Exception as e:
        await ai_repo.update_status(job.id, status="failed", error_message=str(e))
        return AIJobStatusResponse(job_id=job.id, status="failed", error_message=str(e))

@router.post("/room-visualizer", response_model=AIJobStatusResponse)
async def submit_room_visualizer(
    req: AIRoomVisualizerRequest,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    ai_repo = AIJobRepository(session)
    job = await ai_repo.create(
        job_type="room_visualizer",
        input_payload=req.model_dump(),
        user_id=user.id
    )
    
    # Process room visualization composite
    try:
        room = Image.new("RGB", (800, 600), (235, 230, 222))
        buf_r = io.BytesIO()
        room.save(buf_r, format="JPEG")
        dummy_room = buf_r.getvalue()
        dummy_art = dummy_room
        
        framed_art_bytes = FrameCompositor.render_framed_artwork(
            artwork_image_bytes=dummy_art,
            frame_sku=req.placements[0].frame_sku if req.placements else "FP-2201-WAL"
        )
        
        result_bytes = RoomWallDetector.composite_framed_art_on_wall(
            room_image_bytes=dummy_room,
            framed_art_bytes=framed_art_bytes
        )
        
        b64_data = base64.b64encode(result_bytes).decode("utf-8")
        result_url = f"data:image/jpeg;base64,{b64_data}"
        
        await ai_repo.update_status(job.id, status="completed", result_url=result_url)
        return AIJobStatusResponse(job_id=job.id, status="completed", result_url=result_url)
    except Exception as e:
        await ai_repo.update_status(job.id, status="failed", error_message=str(e))
        return AIJobStatusResponse(job_id=job.id, status="failed", error_message=str(e))

@router.get("/jobs/{job_id}", response_model=AIJobStatusResponse)
async def get_job_status(job_id: str, session: AsyncSession = Depends(get_db)):
    ai_repo = AIJobRepository(session)
    job = await ai_repo.get_by_id(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="AI job not found")
    return AIJobStatusResponse(
        job_id=job.id,
        status=job.status,
        result_url=job.result_url,
        error_message=job.error_message
    )

@router.post("/recommend")
async def recommend_frames(req: AIRecommendRequest):
    return AIFrameRecommender.recommend(
        image_style=req.image_style,
        color_palette=req.color_palette
    )

@router.post("/chat", response_model=AIChatResponse)
async def sales_assistant_chat(
    req: AIChatRequest,
    session: AsyncSession = Depends(get_db),
    user = Depends(get_current_user)
):
    chat_repo = AIChatRepository(session)
    session_id = req.session_id or req.conversation_id
    
    # 1. Get or create session
    chat_session = None
    if session_id:
        chat_session = await chat_repo.get_session(session_id)
    
    if not chat_session:
        chat_session = await chat_repo.create_session(
            user_id=user.id if user else None,
            session_title=req.message[:50]
        )
        session_id = chat_session.id

    # 2. Check MAX_AI_CHAT limit
    user_msg_count = await chat_repo.count_user_messages(session_id)
    if settings.MAX_AI_CHAT > 0 and user_msg_count >= settings.MAX_AI_CHAT:
        limit_reply = (
            f"You have reached the limit of {settings.MAX_AI_CHAT} messages for this session. "
            "Our sales team will be happy to assist you directly! Please request a quote or contact staff."
        )
        await chat_repo.add_message(session_id, sender="user", content=req.message)
        await chat_repo.add_message(session_id, sender="assistant", content=limit_reply)
        await session.commit()
        return AIChatResponse(
            session_id=session_id,
            reply=limit_reply,
            suggested_skus=["FP-2201-WAL"],
            escalate_to_crm=True,
            message_count=user_msg_count + 1
        )

    # 3. Retrieve past messages for history
    past_messages = await chat_repo.get_session_messages(session_id)
    history = [
        {"sender": m.sender, "content": m.content}
        for m in past_messages
    ]

    # 4. Save user message to database
    await chat_repo.add_message(session_id, sender="user", content=req.message)

    # 5. Call DeepSeek LLM assistant
    ai_result = LLMAssistant.chat(user_message=req.message, history=history)

    # 6. Save assistant reply to database
    await chat_repo.add_message(
        session_id=session_id,
        sender="assistant",
        content=ai_result["reply"],
        suggested_skus=ai_result.get("suggested_skus")
    )
    await session.commit()

    return AIChatResponse(
        session_id=session_id,
        reply=ai_result["reply"],
        suggested_skus=ai_result.get("suggested_skus", []),
        escalate_to_crm=ai_result.get("escalate_to_crm", False),
        message_count=user_msg_count + 1
    )
