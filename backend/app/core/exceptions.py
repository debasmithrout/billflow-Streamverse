class AppException(Exception):
    """Base application exception for StreamVerse Billing Engine"""
    def __init__(self, message: str):
        super().__init__(message)
        self.message = message

class ResourceNotFound(AppException):
    """Raised when a requested resource is not found"""
    pass

class DuplicateResource(AppException):
    """Raised when trying to create a resource that already exists"""
    pass

class ValidationFailed(AppException):
    """Raised when validation constraints fail"""
    pass

class BusinessRuleViolation(AppException):
    """Raised when business logic rules are violated"""
    pass

class AuthenticationFailed(AppException):
    """Raised when login/credentials validation fails"""
    pass

class AuthorizationFailed(AppException):
    """Raised when role-based permission checks fail"""
    pass
