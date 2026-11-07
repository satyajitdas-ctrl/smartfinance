from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.chat import ChatHistory
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from app.services.assistant_service import assistant_service
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/chat", response_model=ChatMessageResponse, summary="Interact with Grounded AI Assistant")
async def chat_with_assistant(
    payload: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Processes user financial question, derives real ledger metrics,
    and returns a factual grounded answer without financial hallucination.
    """
    res = await assistant_service.answer_query(db, current_user.id, payload.message)

    # Persist interaction into chat_history table
    chat_record = ChatHistory(
        user_id=current_user.id,
        message=payload.message.strip(),
        response=res["response"],
        intent=res["intent"],
    )
    db.add(chat_record)
    db.commit()
    db.refresh(chat_record)

    return ChatMessageResponse(
        id=chat_record.id,
        message=chat_record.message,
        response=chat_record.response,
        intent=chat_record.intent,
        data_context=res.get("data_context"),
        created_at=chat_record.created_at,
    )


@router.get("/history", response_model=List[ChatMessageResponse], summary="Get User Chat History")
def get_chat_history(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieves previous conversational exchanges for the authenticated user."""
    history = (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == current_user.id)
        .order_by(ChatHistory.created_at.asc())
        .limit(limit)
        .all()
    )
    return [
        ChatMessageResponse(
            id=c.id,
            message=c.message,
            response=c.response,
            intent=c.intent,
            created_at=c.created_at,
        )
        for c in history
    ]


@router.delete("/history", summary="Clear Chat History")
def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deletes all conversational records for the authenticated user."""
    db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Chat history cleared successfully."}
