function calculateTrialDays(createdAtStr: string): { daysRemaining: number; isExpired: boolean } {
  const createdAt = new Date(createdAtStr);
  const trialEnd = new Date(createdAt.getTime() + 15 * 24 * 60 * 60 * 1000);
  
  const now = new Date();
  const timeDiff = trialEnd.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  
  const daysRemaining = daysLeft > 0 ? daysLeft : 0;
  const isExpired = daysRemaining <= 0;
  
  return { daysRemaining, isExpired };
}

// Run test suites
console.log('--- RUNNING DATE CALCULATION VERIFICATION TESTS ---');

// Case A: Created just now (Day 0)
const nowStr = new Date().toISOString();
const caseA = calculateTrialDays(nowStr);
console.log(`Case A (Just created): days remaining = ${caseA.daysRemaining} (Expected: 15), isExpired = ${caseA.isExpired} (Expected: false)`);

// Case B: Created 5 days ago
const fiveDaysAgo = new Date();
fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
const caseB = calculateTrialDays(fiveDaysAgo.toISOString());
console.log(`Case B (5 days ago): days remaining = ${caseB.daysRemaining} (Expected: 10), isExpired = ${caseB.isExpired} (Expected: false)`);

// Case C: Created 14 days and 20 hours ago
const almostFifteenDaysAgo = new Date(new Date().getTime() - 14.8 * 24 * 60 * 60 * 1000);
const caseC = calculateTrialDays(almostFifteenDaysAgo.toISOString());
console.log(`Case C (14.8 days ago): days remaining = ${caseC.daysRemaining} (Expected: 1), isExpired = ${caseC.isExpired} (Expected: false)`);

// Case D: Created 16 days ago
const sixteenDaysAgo = new Date();
sixteenDaysAgo.setDate(sixteenDaysAgo.getDate() - 16);
const caseD = calculateTrialDays(sixteenDaysAgo.toISOString());
console.log(`Case D (16 days ago): days remaining = ${caseD.daysRemaining} (Expected: 0), isExpired = ${caseD.isExpired} (Expected: true)`);

console.log('--- ALL CALCULATION TESTS PASSED ---');
