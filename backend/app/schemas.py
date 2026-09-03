from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


ModeName = Literal[
    "generate",
    "debug",
    "explain",
    "optimize",
    "refactor",
    "convert",
    "test",
    "document",
    "chat",
]


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserRead(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class AIRequest(BaseModel):
    mode: ModeName = "generate"
    language: str = Field(default="Python", min_length=1, max_length=60)
    target_language: str | None = Field(default=None, max_length=60)
    instruction: str = Field(default="", max_length=5000)
    code: str = Field(default="", max_length=40000)
    conversation_id: int | None = None

    @field_validator("instruction", "code", "language", "target_language")
    @classmethod
    def strip_text(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value


class AIResult(BaseModel):
    result: str = ""
    explanation: str = ""
    generated_code: str = ""
    corrected_code: str = ""
    issues_found: list[str] = Field(default_factory=list)
    suggested_improvements: list[str] = Field(default_factory=list)
    time_complexity: str = ""
    space_complexity: str = ""
    test_cases: list[str] = Field(default_factory=list)
    documentation: str = ""


class AIResponse(BaseModel):
    conversation_id: int
    assistant_message_id: int
    result: AIResult


class MessageRead(BaseModel):
    id: int
    role: str
    content: str
    payload: dict | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    mode: str = Field(default="chat", max_length=40)


class ConversationUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    mode: str | None = Field(default=None, max_length=40)


class ConversationRead(BaseModel):
    id: int
    title: str
    mode: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationDetail(ConversationRead):
    messages: list[MessageRead] = Field(default_factory=list)


class SnippetCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    language: str = Field(min_length=1, max_length=60)
    code: str = Field(min_length=1, max_length=40000)
    notes: str | None = Field(default=None, max_length=5000)
    conversation_id: int | None = None


class SnippetUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    language: str | None = Field(default=None, min_length=1, max_length=60)
    code: str | None = Field(default=None, min_length=1, max_length=40000)
    notes: str | None = Field(default=None, max_length=5000)


class SnippetRead(BaseModel):
    id: int
    title: str
    language: str
    code: str
    notes: str | None
    conversation_id: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DashboardSummary(BaseModel):
    total_ai_requests: int
    total_conversations: int
    saved_snippets: int
    most_used_language: str
    recent_sessions: list[ConversationRead]

