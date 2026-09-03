from fastapi import APIRouter, Depends
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models import Conversation, Message, SavedSnippet, User
from app.schemas import DashboardSummary


router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    total_conversations = (
        db.query(func.count(Conversation.id))
        .filter(Conversation.owner_id == current_user.id)
        .scalar()
        or 0
    )
    total_ai_requests = (
        db.query(func.count(Message.id))
        .join(Conversation, Conversation.id == Message.conversation_id)
        .filter(Conversation.owner_id == current_user.id, Message.role == "assistant")
        .scalar()
        or 0
    )
    saved_snippets = (
        db.query(func.count(SavedSnippet.id))
        .filter(SavedSnippet.owner_id == current_user.id)
        .scalar()
        or 0
    )
    language_row = (
        db.query(SavedSnippet.language, func.count(SavedSnippet.id).label("total"))
        .filter(SavedSnippet.owner_id == current_user.id)
        .group_by(SavedSnippet.language)
        .order_by(desc("total"))
        .first()
    )
    recent_sessions = (
        db.query(Conversation)
        .filter(Conversation.owner_id == current_user.id)
        .order_by(desc(Conversation.updated_at))
        .limit(5)
        .all()
    )

    return DashboardSummary(
        total_ai_requests=total_ai_requests,
        total_conversations=total_conversations,
        saved_snippets=saved_snippets,
        most_used_language=language_row[0] if language_row else "Python",
        recent_sessions=recent_sessions,
    )

