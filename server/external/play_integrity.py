import os
import json
import logging
from typing import Optional
from pathlib import Path

logger = logging.getLogger("play_integrity")

GCP_KEY_PATH = os.getenv("GCP_KEY_PATH", "config/gcp-key.json")
PACKAGE_NAME = os.getenv("PACKAGE_NAME", "")
CONFIG_DIR = Path(__file__).parent.parent / "config"


class IntegrityVerdict:
    def __init__(self, data):
        self.raw = data

        token_info = data.get("tokenPayloadExternal", {})

        req = token_info.get("requestDetails", {})
        self.package_name = req.get("requestPackageName", "")
        self.nonce = req.get("nonce", "")
        self.timestamp_millis = req.get("timestampMillis", "0")

        app = token_info.get("appIntegrity", {})
        self.app_recognition = app.get("appRecognitionVerdict", "UNEVALUATED")
        self.certificate_sha256 = app.get("certificateSha256Digest", [])
        self.version_code = app.get("versionCode", "")

        device = token_info.get("deviceIntegrity", {})
        self.device_recognition = device.get("deviceRecognitionVerdict", [])

        account = token_info.get("accountDetails", {})
        self.app_licensing = account.get("appLicensingVerdict", "UNEVALUATED")

    @property
    def meets_basic(self):
        return "MEETS_BASIC_INTEGRITY" in self.device_recognition

    @property
    def meets_device(self):
        return "MEETS_DEVICE_INTEGRITY" in self.device_recognition

    @property
    def meets_strong(self):
        return "MEETS_STRONG_INTEGRITY" in self.device_recognition

    @property
    def is_virtual_only(self):
        return (
            "MEETS_VIRTUAL_INTEGRITY" in self.device_recognition
            and "MEETS_DEVICE_INTEGRITY" not in self.device_recognition
            and "MEETS_STRONG_INTEGRITY" not in self.device_recognition
        )

    @property
    def is_empty_device(self):
        return len(self.device_recognition) == 0

    @property
    def is_recognized_app(self):
        return self.app_recognition == "PLAY_RECOGNIZED"

    @property
    def is_licensed(self):
        return self.app_licensing == "LICENSED"


class PlayIntegrityClient:
    def __init__(self):
        self._services: dict[str, object] = {}
        self._default_service = None
        self._default_package = ""
        self._available = False

    def init(self):
        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        for key_file in sorted(CONFIG_DIR.glob("gcp-key*.json")):
            try:
                with open(key_file) as f:
                    key_data = json.load(f)
                project_id = key_data.get("project_id", "")

                credentials = service_account.Credentials.from_service_account_file(
                    str(key_file),
                    scopes=["https://www.googleapis.com/auth/playintegrity"],
                )
                service = build("playintegrity", "v1", credentials=credentials)
                self._services[project_id] = service
                logger.info(f"Play Integrity key loaded: {key_file.name} (project={project_id})")
            except Exception as e:
                logger.error(f"Failed to load {key_file.name}: {e}")

        if self._services:
            self._available = True

        key_path = Path(GCP_KEY_PATH)
        if key_path.exists():
            try:
                with open(key_path) as f:
                    default_project = json.load(f).get("project_id", "")
                self._default_service = self._services.get(default_project)
                self._default_package = PACKAGE_NAME
            except Exception:
                pass

        logger.info(f"Play Integrity: {len(self._services)} key(s) loaded, default_package={self._default_package}")

    def _get_service_for_package(self, package_name: str):
        from config import config_store

        app = config_store.get_app(package_name)
        if app and app.gcp_project_id and app.gcp_project_id in self._services:
            return self._services[app.gcp_project_id], package_name

        if self._default_service:
            return self._default_service, package_name or self._default_package

        if self._services:
            first_service = next(iter(self._services.values()))
            return first_service, package_name or self._default_package

        return None, package_name

    @property
    def available(self):
        return self._available

    async def verify_token(self, integrity_token: str, package_name: str = "") -> Optional[IntegrityVerdict]:
        if not self._available:
            logger.debug("Play Integrity not available, skipping verification")
            return None

        pkg = package_name or self._default_package
        if not pkg:
            logger.warning("No package name for integrity verification")
            return None

        service, resolved_pkg = self._get_service_for_package(pkg)
        if not service:
            logger.warning(f"No GCP service found for package {pkg}")
            return None

        try:
            import asyncio
            loop = asyncio.get_event_loop()

            def _decode():
                return service.v1().decodeIntegrityToken(
                    packageName=resolved_pkg,
                    body={"integrityToken": integrity_token},
                ).execute()

            result = await loop.run_in_executor(None, _decode)
            verdict = IntegrityVerdict(result)

            logger.info(
                f"Integrity [{resolved_pkg}]: app={verdict.app_recognition} "
                f"device={verdict.device_recognition} "
                f"license={verdict.app_licensing}"
            )
            return verdict

        except Exception as e:
            logger.error(f"Play Integrity verify failed [{resolved_pkg}]: {e}")
            return None


play_integrity_client = PlayIntegrityClient()
