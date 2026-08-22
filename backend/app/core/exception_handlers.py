from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

from app.core import exceptions

logger = logging.getLogger("billflow.exception_handlers")

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(exceptions.ResourceNotFound)
    async def resource_not_found_handler(request: Request, exc: exceptions.ResourceNotFound):
        return JSONResponse(
            status_code=404,
            content={"detail": exc.message}
        )

    @app.exception_handler(exceptions.DuplicateResource)
    async def duplicate_resource_handler(request: Request, exc: exceptions.DuplicateResource):
        return JSONResponse(
            status_code=409,
            content={"detail": exc.message}
        )

    @app.exception_handler(exceptions.ValidationFailed)
    async def validation_failed_handler(request: Request, exc: exceptions.ValidationFailed):
        return JSONResponse(
            status_code=400,
            content={"detail": exc.message}
        )

    @app.exception_handler(exceptions.BusinessRuleViolation)
    async def business_rule_violation_handler(request: Request, exc: exceptions.BusinessRuleViolation):
        return JSONResponse(
            status_code=422,
            content={"detail": exc.message}
        )

    @app.exception_handler(exceptions.AuthenticationFailed)
    async def authentication_failed_handler(request: Request, exc: exceptions.AuthenticationFailed):
        return JSONResponse(
            status_code=401,
            content={"detail": exc.message}
        )

    @app.exception_handler(exceptions.AuthorizationFailed)
    async def authorization_failed_handler(request: Request, exc: exceptions.AuthorizationFailed):
        return JSONResponse(
            status_code=403,
            content={"detail": exc.message}
        )

    @app.exception_handler(Exception)
    async def unexpected_exception_handler(request: Request, exc: Exception):
        if isinstance(exc, StarletteHTTPException):
            return JSONResponse(
                status_code=exc.status_code,
                content={"detail": exc.detail}
            )
        if isinstance(exc, RequestValidationError):
            return JSONResponse(
                status_code=422,
                content={"detail": exc.errors()}
            )
            
        logger.error(f"Unexpected exception: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error"}
        )
