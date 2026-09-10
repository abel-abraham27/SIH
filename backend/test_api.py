from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_login():
    res = client.post("/api/v1/auth/login", json={
        "email": "student@cognibridge.demo",
        "password": "Demo@123"
    })
    print("Status:", res.status_code)
    print("Response:", res.json())

if __name__ == "__main__":
    test_login()
