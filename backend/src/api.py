from ninja import NinjaAPI
#from helloWorld.api import router as helloWorld_router
from general.api import router as general_router

api = NinjaAPI()
#api.add_router("/helloWorld/", helloWorld_router)
api.add_router("/general/", general_router)
