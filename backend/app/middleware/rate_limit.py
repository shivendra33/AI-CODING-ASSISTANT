import time
from collections import defaultdict, deque
from collections.abc import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests: int, window_seconds: int):
        super().__init__(app)
        self.requests = requests
        self.window_seconds = window_seconds
        self.clients: dict[str, deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        if request.method == "OPTIONS" or request.url.path in {"/health", "/docs", "/openapi.json"}:
            return await call_next(request)

        key = request.client.host if request.client else "local"
        now = time.monotonic()
        bucket = self.clients[key]

        while bucket and now - bucket[0] > self.window_seconds:
            bucket.popleft()

        if len(bucket) >= self.requests:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please wait a moment and try again."},
            )

        bucket.append(now)
        return await call_next(request)

