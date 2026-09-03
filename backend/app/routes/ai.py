from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models import Conversation, Message, User
from app.schemas import AIRequest, AIResponse
from app.services.ai_provider import AIProvider


router = APIRouter(prefix="/ai", tags=["ai"])


def _title_from_request(payload: AIRequest) -> str:
    source = payload.instruction or f"{payload.mode.title()} {payload.language} code"
    return source[:72].strip() or "New coding session"


@router.post("/analyze", response_model=AIResponse)
def analyze_code(
    payload: AIRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.instruction and not payload.code:
        raise HTTPException(status_code=422, detail="Provide a request, code, or both.")

    conversation = None
    if payload.conversation_id:
        conversation = (
            db.query(Conversation)
            .filter(
                Conversation.id == payload.conversation_id,
                Conversation.owner_id == current_user.id,
            )
            .first()
        )
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found.")

    if conversation is None:
        conversation = Conversation(
            title=_title_from_request(payload),
            mode=payload.mode,
            owner_id=current_user.id,
        )
        db.add(conversation)
        db.flush()

    provider = AIProvider()
    try:
        result = provider.analyze(payload)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="AI provider request failed.") from exc

    user_content = payload.instruction or "Analyze submitted code"
    user_message = Message(
        conversation_id=conversation.id,
        role="user",
        content=user_content,
        payload=payload.model_dump(),
    )
    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=result.result or result.explanation or "AI response",
        payload=result.model_dump(),
    )
    conversation.mode = payload.mode
    conversation.updated_at = datetime.now(timezone.utc)

    db.add_all([user_message, assistant_message, conversation])
    db.commit()
    db.refresh(assistant_message)

    return AIResponse(
        conversation_id=conversation.id,
        assistant_message_id=assistant_message.id,
        result=result,
    )
