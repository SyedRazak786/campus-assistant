"""
Login protection for the API.

The React app sends the student's / faculty's Firebase login token with each
request. This file checks that the token is real, and (for faculty-only
routes) checks the user's role in Firestore.
"""

import os
import time
from typing import Optional

import requests as http
from fastapi import Depends, Header, HTTPException
from google.auth.transport import requests as g_requests
from google.oauth2 import id_token

PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "campus-assistant-5ac1b")

_request = g_requests.Request()

# token -> (claims, valid_until). Avoids re-checking the same token on every
# question, which keeps answers fast.
_verified = {}


def _verify(token: str) -> dict:
    now = time.time()
    hit = _verified.get(token)
    if hit and hit[1] > now:
        return hit[0]

    claims = id_token.verify_firebase_token(token, _request, audience=PROJECT_ID)
    if not claims:
        raise ValueError("empty claims")

    if len(_verified) > 500:
        _verified.clear()
    _verified[token] = (claims, min(float(claims.get("exp", now + 300)), now + 300))
    return claims


def get_current_user(authorization: Optional[str] = Header(default=None)) -> dict:
    """Any logged-in user (student or faculty)."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Please log in first.")

    token = authorization.split(" ", 1)[1].strip()
    try:
        claims = _verify(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Your login expired. Please log in again.")

    uid = claims.get("user_id") or claims.get("sub")
    if not uid:
        raise HTTPException(status_code=401, detail="Invalid login token.")
    return {"uid": uid, "token": token}


def _get_role(uid: str, token: str) -> Optional[str]:
    """Read users/{uid}.role from Firestore, using the user's own token
    (Firestore security rules allow a user to read their own profile)."""
    url = (
        f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}"
        f"/databases/(default)/documents/users/{uid}"
    )
    try:
        resp = http.get(url, headers={"Authorization": f"Bearer {token}"}, timeout=10)
    except Exception:
        return None
    if resp.status_code != 200:
        return None
    fields = resp.json().get("fields", {})
    return fields.get("role", {}).get("stringValue")


def require_faculty(user: dict = Depends(get_current_user)) -> dict:
    """Faculty-only routes."""
    if _get_role(user["uid"], user["token"]) != "faculty":
        raise HTTPException(status_code=403, detail="Faculty access only.")
    return user