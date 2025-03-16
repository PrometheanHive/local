from ninja import NinjaAPI
from general.api import router as general_router

# Debugging: Print loaded router routes
print("General Router Loaded:", general_router)

# Fix: Check `general_router.routes`, NOT `.urls`
print("General Router Available Routes:", general_router.routes)

# Create API instance
api = NinjaAPI(version="1.1.0")

# Register API routers
api.add_router("/general/", general_router)

# Debugging: Print final API routes
print("Final API Routes:", api.urls)
