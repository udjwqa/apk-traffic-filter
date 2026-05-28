import json
import os
import uuid
from pathlib import Path
from datetime import datetime, timezone
from models import EngineConfig, OfferConfig, AppEntry

BASE_DIR = Path(__file__).parent
CONFIG_FILE = BASE_DIR / "config.json"
OFFERS_FILE = BASE_DIR / "offers.json"
APPS_FILE = BASE_DIR / "config" / "apps.json"


class ConfigStore:
    def __init__(self):
        self.engine: EngineConfig = EngineConfig()
        self.offers: OfferConfig = OfferConfig()
        self.apps: list[AppEntry] = []

    def load(self):
        if CONFIG_FILE.exists():
            data = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
            self.engine = EngineConfig(**data)
        else:
            self.save_engine()

        if OFFERS_FILE.exists():
            data = json.loads(OFFERS_FILE.read_text(encoding="utf-8"))
            self.offers = OfferConfig(**data)
        else:
            self.save_offers()

        self._load_apps()

    def save_engine(self):
        CONFIG_FILE.write_text(
            self.engine.model_dump_json(indent=2), encoding="utf-8"
        )

    def save_offers(self):
        OFFERS_FILE.write_text(
            self.offers.model_dump_json(indent=2), encoding="utf-8"
        )

    def update_engine(self, config: EngineConfig):
        self.engine = config
        self.save_engine()

    def update_offers(self, config: OfferConfig):
        self.offers = config
        self.save_offers()

    def _load_apps(self):
        APPS_FILE.parent.mkdir(parents=True, exist_ok=True)
        if APPS_FILE.exists():
            data = json.loads(APPS_FILE.read_text(encoding="utf-8"))
            self.apps = [AppEntry(**a) for a in data]
        else:
            self.apps = []
            self._save_apps()

    def _save_apps(self):
        APPS_FILE.parent.mkdir(parents=True, exist_ok=True)
        APPS_FILE.write_text(
            json.dumps([a.model_dump() for a in self.apps], indent=2, ensure_ascii=False),
            encoding="utf-8",
        )

    def get_app(self, package_name: str) -> AppEntry | None:
        for app in self.apps:
            if app.package_name == package_name:
                return app
        return None

    def get_app_by_id(self, app_id: str) -> AppEntry | None:
        for app in self.apps:
            if app.id == app_id:
                return app
        return None

    def add_app(self, name: str, package_name: str, cert_sha256: str = "",
                safe_url: str = "", target_url: str = "",
                white_flow_type: str = "redirect_safe") -> AppEntry:
        app = AppEntry(
            id=str(uuid.uuid4()),
            name=name,
            package_name=package_name,
            cert_sha256=cert_sha256,
            safe_url=safe_url,
            target_url=target_url,
            white_flow_type=white_flow_type,
            panic_mode=False,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        self.apps.append(app)
        self._save_apps()
        return app

    def update_app(self, app_id: str, updates: dict) -> AppEntry | None:
        for i, app in enumerate(self.apps):
            if app.id == app_id:
                data = app.model_dump()
                data.update({k: v for k, v in updates.items() if k != "id" and k != "created_at"})
                self.apps[i] = AppEntry(**data)
                self._save_apps()
                return self.apps[i]
        return None

    def delete_app(self, app_id: str) -> bool:
        before = len(self.apps)
        self.apps = [a for a in self.apps if a.id != app_id]
        if len(self.apps) < before:
            self._save_apps()
            return True
        return False


config_store = ConfigStore()
