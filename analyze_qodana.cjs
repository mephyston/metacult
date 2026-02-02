const fs = require('fs');

// --- Configuration ---
// Adjust this path to point to your qodana.sarif.json file
const REPORT_PATH = './qodana_analysis/qodana.sarif.json';

// --- Main Execution ---
try {
    if (!fs.existsSync(REPORT_PATH)) {
        console.error(`Error: Report file not found at ${REPORT_PATH}`);
        process.exit(1);
    }

    const reportRaw = fs.readFileSync(REPORT_PATH, 'utf8');
    const report = JSON.parse(reportRaw);

    if (!report.runs || report.runs.length === 0) {
        console.error('Error: No runs found in the SARIF report.');
        process.exit(1);
    }

    const run = report.runs[0];
    const rules = run.tool.driver.rules || [];
    const results = run.results || [];

    console.log(`\n--- Qodana Analysis Report ---`);
    console.log(`Tool: ${run.tool.driver.fullName} (${run.tool.driver.version})`);
    console.log(`Total Issues: ${results.length}\n`);



    // Group by Severity
    const issuesBySeverity = {
        'CRITICAL': [],
        'HIGH': [],
        'MODERATE': [],
        'LOW': [],
        'INFO': [],
        'UNKNOWN': []
    };

    // Mapping loosely based on Qodana <-> SARIF
    // note: Qodana-js usually maps 'error' -> High/Critical, 'warning' -> Moderate, 'note' -> Low
    const mapSeverity = (sarifLevel) => {
        switch (sarifLevel) {
            case 'error': return 'HIGH';
            case 'warning': return 'MODERATE';
            case 'note': return 'LOW';
            case 'none': return 'INFO';
            default: return 'UNKNOWN';
        }
    }

    results.forEach(issue => {
        const severity = mapSeverity(issue.level);
        issuesBySeverity[severity].push(issue);
    });

    // Print Summaries
    Object.keys(issuesBySeverity).forEach(severity => {
        const issues = issuesBySeverity[severity];
        if (issues.length > 0) {
            console.log(`\n--- ${severity} ISSUES (${issues.length}) ---`);

            // Group by Rule ID
            const issuesByRule = {};
            issues.forEach(i => {
                if (!issuesByRule[i.ruleId]) issuesByRule[i.ruleId] = [];
                issuesByRule[i.ruleId].push(i);
            });

            Object.entries(issuesByRule).forEach(([ruleId, ruleIssues]) => {
                const rule = rules.find(r => r.id === ruleId);
                const desc = rule ? rule.shortDescription.text : 'No description';

                console.log(`\nRule: ${ruleId} (${desc})`);
                console.log(`  Frequency: ${ruleIssues.length} issues`);

                // Show first 5 examples
                ruleIssues.slice(0, 5).forEach(issue => {
                    const loc = issue.locations[0].physicalLocation;
                    console.log(`  - ${loc.artifactLocation.uri}:${loc.region.startLine} : ${issue.message.text}`);
                });
                if (ruleIssues.length > 5) {
                    console.log(`    ... and ${ruleIssues.length - 5} more`);
                }
            });
        }
    });

} catch (error) {
    console.error('Failed to parse or analyze report:', error);
}
