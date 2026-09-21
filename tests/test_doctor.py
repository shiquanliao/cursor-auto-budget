import json
import tempfile
import unittest
from pathlib import Path

import doctor


class DoctorTests(unittest.TestCase):
    def test_reads_cursor_version(self):
        with tempfile.TemporaryDirectory() as directory:
            package = Path(directory) / "package.json"
            package.write_text(json.dumps({"version": "3.11.13"}), encoding="utf-8")
            self.assertEqual(doctor.read_cursor_version(package), "3.11.13")

    def test_rejects_invalid_package_json(self):
        with tempfile.TemporaryDirectory() as directory:
            package = Path(directory) / "package.json"
            package.write_text("not-json", encoding="utf-8")
            self.assertIsNone(doctor.read_cursor_version(package))

    def test_no_network_report_is_deterministic(self):
        report = doctor.collect_report(check_network=False)
        self.assertEqual(report["panel_detail"], "skipped")
        self.assertFalse(report["panel_reachable"])
        self.assertEqual(report["install_url"], doctor.INSTALL_URL)


if __name__ == "__main__":
    unittest.main()
