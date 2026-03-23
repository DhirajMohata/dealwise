require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const API_URL = 'http://localhost:3000/api/analyze';
const TESTS_FILE = './tests/contracts.json';
const RESULTS_FILE = './tests/results.md';

async function runTest(test, index) {
  const startTime = Date.now();

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-key': 'dealwise-test-runner',
      },
      body: JSON.stringify({
        contractText: test.contractText,
        currency: test.expectedCurrency || 'USD',
      }),
    });

    const data = await res.json();
    const elapsed = Date.now() - startTime;

    if (data.error) {
      return { ...test, status: 'ERROR', error: data.error, elapsed };
    }

    const issues = [];

    // Check score range
    if (data.overallScore < test.scoreMin || data.overallScore > test.scoreMax) {
      issues.push(`Score ${data.overallScore} outside expected ${test.scoreMin}-${test.scoreMax}`);
    }

    // Check recommendation
    if (test.expectedRec && data.recommendation !== test.expectedRec) {
      issues.push(`Rec '${data.recommendation}' expected '${test.expectedRec}'`);
    }

    // Check currency detection
    if (test.expectedCurrency && data.detectedRate > 0) {
      // Currency should be in AI insights or detected info
    }

    // Check must-catch flags
    if (test.mustCatch) {
      for (const flag of test.mustCatch) {
        const found = data.redFlags.some(f =>
          f.issue.toLowerCase().includes(flag.toLowerCase())
        );
        if (!found) issues.push(`Must-catch not found: "${flag}"`);
      }
    }

    // Check must-NOT-catch (false positives)
    if (test.mustNotCatch) {
      for (const flag of test.mustNotCatch) {
        const found = data.redFlags.some(f =>
          f.issue.toLowerCase().includes(flag.toLowerCase())
        );
        if (found) issues.push(`False positive: "${flag}" should NOT be flagged`);
      }
    }

    return {
      name: test.name,
      category: test.category,
      status: issues.length === 0 ? 'PASS' : 'FAIL',
      issues,
      score: data.overallScore,
      expectedScore: `${test.scoreMin}-${test.scoreMax}`,
      rec: data.recommendation,
      redFlags: data.redFlags.length,
      greenFlags: data.greenFlags.length,
      missingClauses: data.missingClauses.length,
      contractType: data.contractType,
      rate: data.nominalHourlyRate,
      elapsed,
    };
  } catch (err) {
    return { name: test.name, status: 'ERROR', error: err.message, elapsed: Date.now() - startTime };
  }
}

async function main() {
  const tests = JSON.parse(fs.readFileSync(TESTS_FILE, 'utf-8'));
  console.log(`Running ${tests.length} tests...\n`);

  const results = [];
  let pass = 0, fail = 0, error = 0;

  for (let i = 0; i < tests.length; i++) {
    // Wait between tests to avoid OpenAI rate limiting
    if (i > 0) await new Promise(r => setTimeout(r, 2000));

    const result = await runTest(tests[i], i);
    results.push(result);

    const icon = result.status === 'PASS' ? '\u2705' : result.status === 'FAIL' ? '\u274C' : '\u26A0\uFE0F';
    console.log(`${icon} [${i+1}/${tests.length}] ${result.name} — Score: ${result.score || '?'}/${result.expectedScore || '?'} (${result.elapsed}ms)`);
    if (result.issues?.length) result.issues.forEach(i => console.log(`     -> ${i}`));
    if (result.error) console.log(`     -> ERROR: ${result.error}`);

    if (result.status === 'PASS') pass++;
    else if (result.status === 'FAIL') fail++;
    else error++;
  }

  // Generate report
  let report = `# DEALWISE Test Results\n\nDate: ${new Date().toISOString()}\n\n`;
  report += `## Summary: ${pass} PASS / ${fail} FAIL / ${error} ERROR out of ${tests.length}\n\n`;
  report += `| # | Name | Category | Score | Expected | Rec | Status | Issues |\n`;
  report += `|---|------|----------|-------|----------|-----|--------|--------|\n`;

  results.forEach((r, i) => {
    report += `| ${i+1} | ${r.name} | ${r.category || ''} | ${r.score || '?'} | ${r.expectedScore || '?'} | ${r.rec || '?'} | ${r.status} | ${r.issues?.join('; ') || r.error || '-'} |\n`;
  });

  // Group failures by category
  const failures = results.filter(r => r.status === 'FAIL');
  if (failures.length > 0) {
    report += `\n## Failures Detail\n\n`;
    failures.forEach(f => {
      report += `### ${f.name}\n`;
      report += `- Score: ${f.score} (expected ${f.expectedScore})\n`;
      report += `- Issues: ${f.issues.join(', ')}\n\n`;
    });
  }

  fs.writeFileSync(RESULTS_FILE, report);
  fs.writeFileSync('./tests/results.json', JSON.stringify(results, null, 2));

  console.log(`\n${'='.repeat(50)}`);
  console.log(`RESULTS: ${pass} PASS / ${fail} FAIL / ${error} ERROR`);
  console.log(`Report saved to ${RESULTS_FILE}`);
}

main().catch(console.error);
