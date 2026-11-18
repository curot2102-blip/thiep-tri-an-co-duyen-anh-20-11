#!/usr/bin/env python3
"""
Automated Test Runner for Cô Duyên Anh Memorial Web Application
Executes 4-Tier E2E test suites with structured reporting and diagnostics.

Usage:
    python tests/run_tests.py                 # Run full 4-Tier test suite
    python tests/run_tests.py --tier 1        # Run Tier 1 (F1-F15 Features) only
    python tests/run_tests.py --tier 2        # Run Tier 2 (Boundary & Corner Cases)
    python tests/run_tests.py --tier 3        # Run Tier 3 (Cross-Feature Combinations)
    python tests/run_tests.py --tier 4        # Run Tier 4 (Real-World Scenarios)
    python tests/run_tests.py --verbose       # Detailed test diagnostics
"""

import sys
import os
import time
import unittest
import argparse
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from tests.test_tier1_features import TestTier1Features
from tests.test_tier2_boundaries import TestTier2Boundaries
from tests.test_tier3_combinations import TestTier3Combinations
from tests.test_tier4_scenarios import TestTier4Scenarios
from tests.test_google_sheets_sync import TestGoogleSheetsSync


class Color:
    GREEN = "\033[92m"
    RED = "\033[91m"
    YELLOW = "\033[93m"
    CYAN = "\033[96m"
    BOLD = "\033[1m"
    RESET = "\033[0m"


def print_banner():
    print(f"\n{Color.CYAN}{Color.BOLD}" + "=" * 76)
    print("   CÔ DUYÊN ANH 20/11 MEMORIAL WEB — E2E TEST SUITE RUNNER")
    print("=" * 76 + f"{Color.RESET}\n")


def build_suite(tier=None):
    suite = unittest.TestSuite()
    loader = unittest.TestLoader()

    tier_map = {
        1: (TestTier1Features, "Tier 1: Feature Coverage (F1 - F15)"),
        2: (TestTier2Boundaries, "Tier 2: Boundary & Corner Cases"),
        3: (TestTier3Combinations, "Tier 3: Cross-Feature Combinations"),
        4: (TestTier4Scenarios, "Tier 4: Real-World Scenarios"),
        5: (TestGoogleSheetsSync, "Tier 5: Google Sheets & GAS Sync (R1 - R4)"),
    }

    if tier in tier_map:
        test_class, desc = tier_map[tier]
        print(f"[*] Targeting: {Color.BOLD}{desc}{Color.RESET}")
        suite.addTests(loader.loadTestsFromTestCase(test_class))
    else:
        print("[*] Targeting: Full 5-Tier Test Suite")
        for t_num, (test_class, desc) in tier_map.items():
            suite.addTests(loader.loadTestsFromTestCase(test_class))

    return suite


def run():
    parser = argparse.ArgumentParser(description="E2E Test Runner")
    parser.add_argument("--tier", type=int, choices=[1, 2, 3, 4, 5], help="Run specific test tier (1-5)")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose test execution output")
    parser.add_argument("--failfast", action="store_true", help="Stop on first test failure")
    args = parser.parse_args()

    print_banner()

    start_time = time.time()
    suite = build_suite(tier=args.tier)
    verbosity = 2 if args.verbose else 1

    runner = unittest.TextTestRunner(verbosity=verbosity, failfast=args.failfast)
    result = runner.run(suite)
    elapsed = time.time() - start_time

    total = result.testsRun
    failures = len(result.failures)
    errors = len(result.errors)
    passed = total - failures - errors

    print("\n" + "=" * 76)
    print(f"{Color.BOLD}TEST EXECUTION SUMMARY{Color.RESET}")
    print("=" * 76)
    print(f"  Total Tests Executed : {total}")
    print(f"  Passed Tests         : {Color.GREEN}{passed}{Color.RESET}")
    print(f"  Failed Tests         : {Color.RED}{failures}{Color.RESET}")
    print(f"  Errored Tests        : {Color.YELLOW}{errors}{Color.RESET}")
    print(f"  Execution Time       : {elapsed:.3f}s")
    print("=" * 76)

    if failures > 0 or errors > 0:
        print(f"\n{Color.YELLOW}[!] Diagnostic Note:{Color.RESET}")
        print("  Some tests may fail if the corresponding features (Milestones M1-M5)")
        print("  are currently pending implementation by teamwork_worker_1.")
        print("  This is normal during active implementation milestones in TDD workflows.\n")

    return 0 if (failures == 0 and errors == 0) else 1


if __name__ == "__main__":
    sys.exit(run())
