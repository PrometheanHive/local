from ninja import NinjaAPI
from general.api import router as general_router

# Create API instance
api = NinjaAPI(version="1.1.0")

# Register API routers
api.add_router("/general/", general_router)
