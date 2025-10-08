from fastapi.testclient import TestClient
from app.main import app

client = TestCllient(app)
def test_root(): r = client.get("/")   assert r.status_code ==200  assert r.json() =={"message": "RIZON API running"}
