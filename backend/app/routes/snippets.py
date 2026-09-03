from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, or_
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.models import Conversation, SavedSnippet, User
from app.schemas import SnippetCreate, SnippetRead, SnippetUpdate


router = APIRouter(prefix="/snippets", tags=["snippets"])


@router.get("", response_model=list[SnippetRead])
def list_snippets(
    search: str = Query(default="", max_length=120),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(SavedSnippet).filter(SavedSnippet.owner_id == current_user.id)
    if search:
        query = query.filter(
            or_(
                SavedSnippet.title.ilike(f"%{search}%"),
                SavedSnippet.language.ilike(f"%{search}%"),
            )
        )
    return query.order_by(desc(SavedSnippet.created_at)).all()


@router.post("", response_model=SnippetRead, status_code=status.HTTP_201_CREATED)
def create_snippet(
    payload: SnippetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.conversation_id:
        exists = (
            db.query(Conversation)
            .filter(
                Conversation.id == payload.conversation_id,
                Conversation.owner_id == current_user.id,
            )
            .first()
        )
        if not exists:
            raise HTTPException(status_code=404, detail="Conversation not found.")

    snippet = SavedSnippet(owner_id=current_user.id, **payload.model_dump())
    db.add(snippet)
    db.commit()
    db.refresh(snippet)
    return snippet


@router.patch("/{snippet_id}", response_model=SnippetRead)
def update_snippet(
    snippet_id: int,
    payload: SnippetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    snippet = (
        db.query(SavedSnippet)
        .filter(SavedSnippet.id == snippet_id, SavedSnippet.owner_id == current_user.id)
        .first()
    )
    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found.")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(snippet, key, value)
    db.add(snippet)
    db.commit()
    db.refresh(snippet)
    return snippet


@router.delete("/{snippet_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_snippet(
    snippet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    snippet = (
        db.query(SavedSnippet)
        .filter(SavedSnippet.id == snippet_id, SavedSnippet.owner_id == current_user.id)
        .first()
    )
    if not snippet:
        raise HTTPException(status_code=404, detail="Snippet not found.")
    db.delete(snippet)
    db.commit()
    return None

