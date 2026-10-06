from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.operations import router as operations_router


app = FastAPI(
    title="AquaSentinel API"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(operations_router)

@app.get("/")
def root():
    return {"message": "AquaSentinel API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}