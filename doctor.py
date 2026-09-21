#!/usr/bin/env python3
"""Read-only environment check for the MixrAI Cursor installation flow."""

from __future__ import annotations

import argparse
import json
import os
import platform
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Iterable

INSTALL_URL = "https://panel.mixrai.com/cursor-install"


def cursor_package_candidates() -> Iterable[Path]:
    system = platform.system()
    home = Path.home()
    if system == "Darwin":
        yield Path("/Applications/Cursor.app/Contents/Resources/app/package.json")
        yield home / "Applications/Cursor.app/Contents/Resources/app/package.json"
    elif system == "Windows":
        local = Path(os.environ.get("LOCALAPPDATA", ""))
        if str(local):
            yield local / "Programs/cursor/resources/app/package.json"
            yield local / "cursor/resources/app/package.json"
    else:
        yield Path("/usr/share/cursor/resources/app/package.json")
        yield Path("/opt/Cursor/resources/app/package.json")
        yield home / ".local/share/cursor/resources/app/package.json"


def read_cursor_version(path: Path) -> str | None:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None
    version = data.get("version")
    return version if isinstance(version, str) and version.strip() else None


def find_cursor() -> tuple[Path | None, str | None]:
    for path in cursor_package_candidates():
        if path.is_file():
            return path, read_cursor_version(path)
    return None, None


def check_panel(timeout: float = 5.0) -> tuple[bool, str]:
    request = urllib.request.Request(
        "https://panel.mixrai.com/",
        headers={"User-Agent": "cursor-auto-starter-doctor/1.0"},
        method="GET",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return 200 <= response.status < 400, f"HTTP {response.status}"
    except urllib.error.HTTPError as exc:
        return False, f"HTTP {exc.code}"
    except (urllib.error.URLError, TimeoutError) as exc:
        return False, str(exc.reason if isinstance(exc, urllib.error.URLError) else exc)


def collect_report(check_network: bool = True) -> dict[str, object]:
    package_path, version = find_cursor()
    panel_ok, panel_detail = check_panel() if check_network else (False, "skipped")
    return {
        "system": platform.system(),
        "release": platform.release(),
        "architecture": platform.machine(),
        "python": platform.python_version(),
        "cursor_found": package_path is not None,
        "cursor_version": version,
        "cursor_package": str(package_path) if package_path else None,
        "panel_reachable": panel_ok,
        "panel_detail": panel_detail,
        "install_url": INSTALL_URL,
    }


def print_human(report: dict[str, object]) -> None:
    mark = lambda value: "✓" if value else "✗"
    print("Cursor Auto Starter · 环境检测")
    print("-" * 38)
    print(f"系统: {report['system']} {report['release']} ({report['architecture']})")
    print(f"Python: {report['python']}")
    print(
        f"{mark(report['cursor_found'])} Cursor: "
        + (
            f"已找到，版本 {report['cursor_version'] or '未知'}"
            if report["cursor_found"]
            else "未找到"
        )
    )
    print(f"{mark(report['panel_reachable'])} 平台连接: {report['panel_detail']}")
    print("-" * 38)
    print(f"安装入口: {report['install_url']}")


def main() -> int:
    parser = argparse.ArgumentParser(description="只读检查 Cursor 环境和平台连接")
    parser.add_argument("--json", action="store_true", help="输出 JSON")
    parser.add_argument("--no-network", action="store_true", help="跳过网络检查")
    args = parser.parse_args()

    report = collect_report(check_network=not args.no_network)
    if args.json:
        json.dump(report, sys.stdout, ensure_ascii=False, indent=2)
        print()
    else:
        print_human(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
