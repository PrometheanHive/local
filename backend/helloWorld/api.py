from ninja import Router, Schema

router = Router()

#regular get, one parameter, accessed at http://0.0.0.0:5000/api/helloWorld/hello?name=world
@router.get("/hello")
def hello(request, name="world"):
    return f"Hello {name}"

#get with type inputs, http://0.0.0.0:5000/api/helloWorld/math?a=3&b=4
@router.get("/math")
def math(request, a: int, b: int):
    return {"add": a + b, "multiply": a * b}


#get with input from path, dont use, 
@router.get("/math2/{a}and{b}")
def math(request, a: int, b: int):
    return {"add": a + b, "multiply": a * b}

#schema
class HelloSchema(Schema):
    name: str = "world"

@router.post("/posthello")
def hello(request, data: HelloSchema):
    return f"Hello {data.name}"


#user example stuff
class UserSchema(Schema):
    username: str
    email: str
    first_name: str
    last_name: str
    is_authenticated: bool = False


class Error(Schema):
    message: str

@router.get("/me", response={200: UserSchema, 403: Error})
def me(request):
    if not request.user.is_authenticated:
        return 403, {"message": "Please sign in first"}
    return request.user 