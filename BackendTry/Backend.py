import sqlite3 as sql
import os
from pathlib import Path
from uuid import uuid4
from pwdlib import PasswordHash
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel,EmailStr,Field,field_validator
from fastapi  import FastAPI,status, UploadFile, File,Form, HTTPException,Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
import jwt 
from dotenv import load_dotenv
load_dotenv()
from jwt.exceptions import InvalidTokenError
from datetime import datetime , timedelta,timezone 
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
DATABASE_PATH = BASE_DIR / "list.db"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
password_hash = PasswordHash.recommended()
SECRET_KEY = os.getenv("SECRET_KEY") or "replace-this-with-a-long-random-secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
app = FastAPI()
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

# 2. Add the middleware to your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Allows your specific frontend
    allow_credentials=True,
    allow_methods=["*"],               # Allows GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],           # Allows all headers
)
class loginrequest(BaseModel):
    email : str = Field(...)
    password : str = Field(...)
    @field_validator('email', 'password')
    @classmethod
    def validated_whitespace(cls,v:str):
        return v.strip()
def create_access_token(user_id: int, username: str):
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "username": username,
        "exp": expire,
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
class RegisterRequest(BaseModel):
    username:str = Field(...,min_length=3,max_length=50)
    email : EmailStr
    password: str = Field(..., min_length=8)
    @field_validator('username', 'password')
    @classmethod
    def validated_whitesapce(cls, v:str)->str:
        return v.strip()
class Productresponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    type: str
    image: str |  None
    contact: str | None
class Productrcreate(BaseModel):
    name: str
    description: str
    price: float
    type: str
    image: str
    contact: str
@app.post("/api/login")
def login_user(user: loginrequest):
    email = user.email.strip().lower()

    conn = sql.connect(DATABASE_PATH)
    cur = conn.cursor()

    cur.execute(
        """
        SELECT userid, username, email, hash_password
        FROM users
        WHERE email = ?
        """,
        (email,)
    )

    account = cur.fetchone()  # Must run before checking account
    conn.close()

    if account is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    userid, username, email, stored_hash = account

    if not password_hash.verify(user.password, stored_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(userid, username)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "message": "Login successful",
        "userid": userid,
        "username": username,
        "email": email,
    } 
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")
        username = payload.get("username")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return {
            "userid": int(user_id),
            "username": username
        }

    except InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            detail=TimeoutError
        )
@app.post("/api/register",status_code=status.HTTP_201_CREATED)
def register_new_user(user:RegisterRequest): 
    if not user.password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot be empty or only space. and Try to form  the data agin"
            
        )
    hashed_password = password_hash.hash(user.password)
    email_lowercase = user.email.lower()
    with sql.connect(DATABASE_PATH) as conn:
        cur = conn.cursor()
        try:
            cur.execute("""
              INSERT INTO users(email,username,hash_password) 
              VALUES(?,?,?)
             """,(email_lowercase,user.username,hashed_password)
            )
            conn.commit()
            user_id = cur.lastrowid
        except sql.IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Username or email is already exists"
            )
    return{
        "id":user_id,
        "username":user.username,
        "email":email_lowercase,
        "message" : "acount created successfully"
    }
@app.get("/api/me")
def get_me(current_user=Depends(get_current_user)):
    with sql.connect(DATABASE_PATH) as conn:
        conn.row_factory = sql.Row
        cur = conn.cursor()
        cur.execute(
            """
            SELECT userid, username, email, createdat
                        FROM users
                        WHERE userid = ?
            """
            ,(current_user["userid"],)
        )
    user = cur.fetchone()
    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User NOT FOND"
        )
    return dict(user)
@app.post("/api/products", response_model=Productresponse)
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    type: str = Form(...),
    contact: str = Form(...),
    image: UploadFile = File(...)
):
    print("IMAGE:", image)
    print("FILENAME:", image.filename)
    filename = f"{uuid4().hex}{Path(image.filename or '').suffix.lower()}"
    file_path = UPLOAD_DIR / filename
    with file_path.open("wb") as buffer:
        buffer.write(await image.read())

    conn = sql.connect(DATABASE_PATH)
    cur = conn.cursor()
    cur.execute("INSERT INTO list ( name, description, price, type, image, contact) VALUES (?, ?, ?, ?, ?, ?)",
                (name, description, price, type, filename, contact))
    new_id = cur.lastrowid
    conn.commit()
    conn.close()
    return {
        "id": new_id,
        "name": name,
        "description": description,
        "price": price,
        "type": type,
        "image": filename,
        "contact": contact
    }
@app.get("/api/products", response_model=list[Productresponse])
def products():
    conn = sql.connect(DATABASE_PATH)
    cur = conn.cursor()
    cur.execute("SELECT * FROM list")
    rows = cur.fetchall()
    conn.close()
    product = []
    for row in rows:
       product.append({
    "id": row[0],
    "name": row[1],
    "description": row[2],
    "price": row[3],
    "type": row[4],
    "image": os.path.basename(row[5]) if row[5] else None,
    "contact": row[6]
})
    return product
print("done!!")