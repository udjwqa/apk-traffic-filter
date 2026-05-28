from fastapi import APIRouter
from fastapi.responses import JSONResponse
from config import config_store
from models import AppEntryCreate

router = APIRouter()


@router.get("/api/apps")
async def get_apps():
    return [a.model_dump() for a in config_store.apps]


@router.post("/api/apps")
async def create_app(body: AppEntryCreate):
    existing = config_store.get_app(body.package_name)
    if existing:
        return JSONResponse(
            {"error": f"App with package '{body.package_name}' already exists"},
            status_code=409,
        )
    app = config_store.add_app(
        name=body.name,
        package_name=body.package_name,
        cert_sha256=body.cert_sha256,
        safe_url=body.safe_url,
        target_url=body.target_url,
        white_flow_type=body.white_flow_type,
    )
    return app.model_dump()


@router.put("/api/apps/{app_id}")
async def update_app(app_id: str, body: dict):
    app = config_store.update_app(app_id, body)
    if not app:
        return JSONResponse({"error": "App not found"}, status_code=404)
    return app.model_dump()


@router.delete("/api/apps/{app_id}")
async def delete_app(app_id: str):
    if config_store.delete_app(app_id):
        return {"success": True, "id": app_id}
    return JSONResponse({"error": "App not found"}, status_code=404)


@router.put("/api/apps/{app_id}/panic")
async def toggle_panic(app_id: str):
    app = config_store.get_app_by_id(app_id)
    if not app:
        return JSONResponse({"error": "App not found"}, status_code=404)
    config_store.update_app(app_id, {"panic_mode": not app.panic_mode})
    return {"success": True, "panic_mode": not app.panic_mode}
