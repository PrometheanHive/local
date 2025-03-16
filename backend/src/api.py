from ninja import NinjaAPI
from general.api import router as general_router

# Create a SINGLE instance of NinjaAPI with a unique version
api = NinjaAPI()

# Debugging: Print loaded routes
print("Loaded API Routes:", api.urls)

# Register API routers
api.add_router("/general/", general_router)
