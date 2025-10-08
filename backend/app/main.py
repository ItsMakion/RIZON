from fastapi import FastAPI
app = FastAPI(title="RIZON API", version="0.1")
@app.get("/") 
async def root(): return {message": "RIZON API running"}
