#!/usr/bin/env python3
# SecretSweeper: Cursor Command for AdTopia - Hunts Hardcoded Tokens/APIs
# Run: python secret_sweeper.py [path_to_scan] (default: .)
# Outputs: Markdown report w/ flags & fixes. Ignores .env, node_modules, dist/.

import os
import re
import sys
import subprocess
from pathlib import Path
from typing import List, Tuple

# OWASP-inspired patterns (2025 update: Covers OpenAI, Supabase, Vercel, AWS, etc.)
SECRET_PATTERNS = {
    'OpenAI_API_KEY': r'sk-[a-zA-Z0-9]{48,}',  # sk-proj-... or legacy sk-
    'Supabase_ANON_KEY': r'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9_-]{100,}',  # JWT base64
    'Supabase_SERVICE_ROLE': r'eyJpc3N1ZXIiOmZhbHNlLCJyb2xlIjoiYXV0aC5hZG1pbiJ9\.[a-zA-Z0-9_-]{100,}',  # Service JWT
    'Vercel_TOKEN': r'vercel_[a-zA-Z0-9]{32,}',  # vercel_pat_...
    'AWS_ACCESS_KEY': r'AKIA[0-9A-Z]{16}',  # AWS AKIA...
    'AWS_SECRET_KEY': r'[a-zA-Z0-9/+=]{40}',  # Follows access key
    'Gamma_API_KEY': r'gamma_[a-zA-Z0-9]{32,}',  # Hypothetical; tweak for your API
    'Generic_JWT': r'eyJ[A-Za-z0-9-_]+?\.[A-Za-z0-9-_]+?\.[A-Za-z0-9-_]+',  # Broad JWT catch
    'Generic_API_KEY': r'(?i)(api[-_]?key|token|secret)[=:]\s*["\']?[a-zA-Z0-9]{20,}["\']?',  # Labeled keys
}

# Ignore paths (AdTopia-specific: Skip builds, envs, uploads, docs, outputs)
IGNORE_PATHS = {
    '.env*', 'node_modules/', 'dist/', 'build/', '.git/', 'uploads/', '*.log', 'gamma-exports/',
    'package-lock.json', '*.sh', 'test-*.js', 'test-*.sh', '*.md', 'docs/', 'outputs/', 
    '__pycache__/', '*.pyc', '*.json', '*.txt', '*.yml', '*.yaml', '.cursor/', 'supabase/migrations/'
}

def is_ignored(path: Path) -> bool:
    """Check if file/path should be skipped."""
    rel_path = path.relative_to(Path.cwd())
    for ignore in IGNORE_PATHS:
        if str(rel_path).startswith(ignore):
            return True
        # Handle glob patterns safely
        if '*' in ignore:
            import fnmatch
            if fnmatch.fnmatch(str(rel_path), ignore):
                return True
    return False

def get_git_tracked_files(root: Path = Path('.')) -> List[Path]:
    """Fetch only git-tracked files (faster, secure)."""
    try:
        result = subprocess.run(['git', 'ls-files'], cwd=root, capture_output=True, text=True)
        if result.returncode != 0:
            print("Warning: Git not detected—falling back to full scan.")
            return [p for p in root.rglob('*') if p.is_file() and not is_ignored(p)]
        return [root / f for f in result.stdout.strip().split('\n') if f]
    except Exception:
        return [p for p in root.rglob('*') if p.is_file() and not is_ignored(p)]

def scan_file(file_path: Path, patterns: dict) -> List[Tuple[str, str, int]]:
    """Scan single file for secrets, return (pattern_name, match, line_num)."""
    findings = []
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            for line_num, line in enumerate(f, 1):
                for name, pattern in patterns.items():
                    matches = re.finditer(pattern, line)
                    for match in matches:
                        findings.append((name, match.group(0), line_num))
    except Exception:
        pass  # Skip binary/non-text
    return findings

def main(scan_path: str = '.'):
    root = Path(scan_path).resolve()
    if not root.exists():
        print(f"Error: Path {scan_path} not found.")
        sys.exit(1)

    print("🔍 SecretSweeper: Auditing AdTopia codebase for hardcoded tokens...")
    files = get_git_tracked_files(root)
    print(f"Scanning {len(files)} git-tracked files...")

    all_findings = []
    for file_path in files:
        if is_ignored(file_path):
            continue
        findings = scan_file(file_path, SECRET_PATTERNS)
        if findings:
            all_findings.extend([(str(file_path), *finding) for finding in findings])

    # Report
    print("\n--- AUDIT REPORT ---")
    if not all_findings:
        print("✅ EMPIRE SECURE: No hardcoded secrets detected! $600K ARR vault locked.")
        return

    print(f"⚠️  {len(all_findings)} POTENTIAL LEAKS FOUND:")
    for file_path, pattern_name, match, line_num in all_findings:
        print(f"  - File: {file_path} (Line {line_num})\n    Pattern: {pattern_name}\n    Match: {match[:20]}... [REDACTED]\n    Fix: Migrate to .env (e.g., process.env.OPENAI_API_KEY) & git rm --cached {file_path}")

    # Markdown export for Cursor notes
    report_md = "# AdTopia Secret Audit Report\n\n## Findings\n"
    for file_path, pattern_name, match, line_num in all_findings:
        report_md += f"- **{file_path}:{line_num}** ({pattern_name}): `{match[:10]}...` → [.env migrate]\n"
    report_md += "\n## Next: Run `git add .env.example` & commit fixes."
    with open('secret_audit.md', 'w') as f:
        f.write(report_md)
    print(f"\n📄 Full report: secret_audit.md (Open in Cursor for diffs).")

    sys.exit(1 if all_findings else 0)

if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')
