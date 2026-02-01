#!/usr/bin/env python3
"""
Batch fix Qodana issues:
- Remove unused imports
- Remove unnecessary local variables  
- Check for redundant generic types
"""

import json
import re
from pathlib import Path

SARIF_PATH = Path("/Users/david/Downloads/qodana-report/qodana.sarif.json")

def load_sarif():
    with open(SARIF_PATH) as f:
        return json.load(f)

def get_issues_by_rule(sarif_data, rule_id):
    """Extract all issues for a specific rule"""
    issues = []
    for result in sarif_data['runs'][0]['results']:
        if result['ruleId'] == rule_id:
            location = result['locations'][0]['physicalLocation']
            issues.append({
                'file': location['artifactLocation']['uri'],
                'line': location['region']['startLine'],
                'message': result['message']['text']
            })
    return issues

def extract_import_to_remove(message):
    """Parse Qodana message to extract what toremove"""
    # Pattern: "Unused import { X } from 'Y';" or "Unused import specifier X"
    match = re.search(r"Unused import specifier (\w+)", message)
    if match:
        return match.group(1)
    
    match = re.search(r"Unused import \{?\s*([^}]+?)\s*\}? from", message)
    if match:
        return match.group(1).strip()
    
    return None

def main():
    print("📊 Qodana Batch Cleanup")
    sarif = load_sarif()
    
    # Only get ES6UnusedImports for now (43 occurrences)
    print("\n🔍 Analyzing ES6UnusedImports...")
    unused_imports = get_issues_by_rule(sarif, "ES6UnusedImports")
    
    # Group by file
    by_file = {}
    for issue in unused_imports:
        file_path = issue['file']
        if file_path not in by_file:
            by_file[file_path] = []
        by_file[file_path].append(issue)
    
    print(f"\n📁 Found {len(unused_imports)} unused imports across {len(by_file)} files:\n")
    for file_path, issues in sorted(by_file.items()):
        print(f"  {file_path}: {len(issues)} unused imports")
        for issue in issues:
            to_remove = extract_import_to_remove(issue['message'])
            if to_remove:
                print(f"    Line {issue['line']}: Remove '{to_remove}'")

if __name__ == "__main__":
    main()
