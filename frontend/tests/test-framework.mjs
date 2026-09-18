/**
 * ClaimGuard AI E2E Test Framework
 * Zero-dependency, lightweight, high-precision test engine for ES Modules.
 * Supports sync & async specs, rich assertions, mock API simulation, and tier reporting.
 */

class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

class TestContext {
  constructor() {
    this.currentSuite = null;
    this.suites = [];
    this.currentTier = 1;
    this.tierResults = {
      1: { name: 'Tier 1: Feature Coverage', passed: 0, failed: 0, total: 0, tests: [] },
      2: { name: 'Tier 2: Boundary Cases', passed: 0, failed: 0, total: 0, tests: [] },
      3: { name: 'Tier 3: Combinations & Cross-Module', passed: 0, failed: 0, total: 0, tests: [] },
      4: { name: 'Tier 4: Real-World Scenarios', passed: 0, failed: 0, total: 0, tests: [] }
    };
  }

  setTier(tierNumber) {
    this.currentTier = tierNumber;
  }
}

export const context = new TestContext();

export function setTier(tierNumber) {
  context.setTier(tierNumber);
}

export function describe(suiteName, fn) {
  const suite = {
    name: suiteName,
    tier: context.currentTier,
    tests: [],
    beforeEachFns: [],
    afterEachFns: []
  };
  context.suites.push(suite);
  context.currentSuite = suite;
  fn();
  context.currentSuite = null;
}

export function it(testName, fn) {
  if (!context.currentSuite) {
    throw new Error(`Test "${testName}" must be defined inside a describe() block`);
  }
  context.currentSuite.tests.push({
    name: testName,
    fn,
    tier: context.currentSuite.tier
  });
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

export function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`, actual, expected);
      }
    },
    toEqual(expected) {
      if (!deepEqual(actual, expected)) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to deeply equal ${JSON.stringify(expected)}`, actual, expected);
      }
    },
    toBeCloseTo(expected, precision = 2) {
      const diff = Math.abs(actual - expected);
      const tolerance = Math.pow(10, -precision) / 2;
      if (diff > tolerance) {
        throw new AssertionError(`Expected ${actual} to be close to ${expected} (diff: ${diff}, tolerance: ${tolerance})`, actual, expected);
      }
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) {
        throw new AssertionError(`Expected ${actual} to be greater than ${expected}`, actual, expected);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (!(actual >= expected)) {
        throw new AssertionError(`Expected ${actual} to be greater than or equal to ${expected}`, actual, expected);
      }
    },
    toBeLessThan(expected) {
      if (!(actual < expected)) {
        throw new AssertionError(`Expected ${actual} to be less than ${expected}`, actual, expected);
      }
    },
    toBeLessThanOrEqual(expected) {
      if (!(actual <= expected)) {
        throw new AssertionError(`Expected ${actual} to be less than or equal to ${expected}`, actual, expected);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be null`, actual, null);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new AssertionError(`Expected value to be defined, but received undefined`, actual, 'defined');
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new AssertionError(`Expected value to be undefined, but received ${JSON.stringify(actual)}`, actual, undefined);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be truthy`, actual, true);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new AssertionError(`Expected ${JSON.stringify(actual)} to be falsy`, actual, false);
      }
    },
    toContain(expectedItem) {
      if (typeof actual === 'string') {
        if (!actual.includes(expectedItem)) {
          throw new AssertionError(`Expected string "${actual}" to contain "${expectedItem}"`, actual, expectedItem);
        }
      } else if (Array.isArray(actual)) {
        const found = actual.some(item => deepEqual(item, expectedItem) || item === expectedItem);
        if (!found) {
          throw new AssertionError(`Expected array ${JSON.stringify(actual)} to contain ${JSON.stringify(expectedItem)}`, actual, expectedItem);
        }
      } else {
        throw new AssertionError(`toContain requires string or array, got ${typeof actual}`, actual, expectedItem);
      }
    },
    toMatch(regex) {
      if (!regex.test(String(actual))) {
        throw new AssertionError(`Expected "${actual}" to match regex ${regex}`, actual, regex.toString());
      }
    },
    toThrow(expectedMessageOrRegex) {
      if (typeof actual !== 'function') {
        throw new AssertionError(`toThrow expected a function, received ${typeof actual}`);
      }
      let threw = false;
      let error = null;
      try {
        actual();
      } catch (err) {
        threw = true;
        error = err;
      }
      if (!threw) {
        throw new AssertionError(`Expected function to throw an error, but it returned normally.`);
      }
      if (expectedMessageOrRegex) {
        if (expectedMessageOrRegex instanceof RegExp) {
          if (!expectedMessageOrRegex.test(error.message)) {
            throw new AssertionError(`Expected error message "${error.message}" to match ${expectedMessageOrRegex}`);
          }
        } else if (typeof expectedMessageOrRegex === 'string') {
          if (!error.message.includes(expectedMessageOrRegex)) {
            throw new AssertionError(`Expected error message "${error.message}" to contain "${expectedMessageOrRegex}"`);
          }
        }
      }
    }
  };
}

// ------------------------------------------------------------------
// Mock Factory & Business Logic Helpers for E2E Testing
// ------------------------------------------------------------------

export const formatInr = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const normalizeStats = (backendStats = {}) => ({
  total_claims: backendStats.total_claims ?? 0,
  pending_analysis: backendStats.pending_analysis ?? backendStats.pending_claims ?? 0,
  mismatches_found: backendStats.mismatches_found ?? 0,
  total_recovered_amount: backendStats.total_recovered_amount ?? backendStats.total_amount_recovered ?? 0,
});

export const normalizeAnalysisResult = (data = {}) => {
  const core = data.result || data;
  return {
    ...core,
    analysis_run_id: data.analysis_run_id || core.analysis_run_id,
    status: data.status || core.status || 'COMPLETED',
    overall_status: core.overall_status || 'MISMATCH_DETECTED',
    total_monetary_impact: core.total_monetary_impact ?? 0,
    rule_verdicts: core.rule_verdicts || [],
    forensics: core.forensics || null,
  };
};

export const normalizeAppealDraft = (data = {}) => ({
  appeal_text: data.appeal_text || data.appeal_letter || data.content || data.draft || '',
  regulatory_citations: data.regulatory_citations || [],
  monetary_impact: data.monetary_impact ?? 0,
});

/**
 * Statutory IRDAI Proportionate Deduction Calculator
 * Implements IRDAI Master Circular (May 2024):
 * Only room-linked items can be proportionately reduced. Fixed/medical items must NOT be reduced.
 */
export function calculateProportionateDeduction({
  actualRoomRate,
  policyRoomLimit,
  roomLinkedAmount,
  fixedMedicalAmount,
  copayPercentage = 0,
  insurerPaid = 0
}) {
  if (policyRoomLimit === null || policyRoomLimit === undefined || actualRoomRate <= policyRoomLimit) {
    const totalAmount = roomLinkedAmount + fixedMedicalAmount;
    const correctPayable = totalAmount * (1 - copayPercentage / 100);
    return {
      status: 'PASS',
      factor: 1.0,
      correctPayable,
      insurerPaid,
      monetaryImpact: Math.max(0, correctPayable - insurerPaid),
      finding: actualRoomRate <= policyRoomLimit
        ? 'Actual room rate is within policy limit. No deduction applicable.'
        : 'No room rent limit in policy. Proportionate deduction not applicable.'
    };
  }

  const factor = policyRoomLimit / actualRoomRate;
  const allowedRoomLinked = roomLinkedAmount * factor;
  const subtotalPayable = allowedRoomLinked + fixedMedicalAmount;
  const correctPayable = subtotalPayable * (1 - copayPercentage / 100);
  const monetaryImpact = Math.max(0, correctPayable - insurerPaid);

  let status = 'FAIL';
  let finding = `Room rate exceeds limit (₹${actualRoomRate} vs ₹${policyRoomLimit}). Proportionate factor ${factor.toFixed(4)} applies only to room charges. Insurer improperly deducted non-room medical expenses.`;

  if (insurerPaid >= correctPayable) {
    status = 'NEEDS_REVIEW';
    finding = 'Insurer approved amount is higher than calculated correct payable. Manual review needed.';
  }

  return {
    status,
    factor,
    correctPayable,
    insurerPaid,
    monetaryImpact,
    finding,
    regulatoryCitation: 'IRDAI Master Circular May 2024: Proportionate deduction restricted strictly to room-associated categories.'
  };
}

/**
 * Moratorium Period Rule Evaluator
 * Evaluates policy duration against 36-month (Insurance Act Sec 45) and 60-month (IRDAI Moratorium) rules.
 */
export function evaluateMoratoriumRule({ policyInceptionDate, claimDate, rejectionReason = 'PRE_EXISTING' }) {
  if (!policyInceptionDate || !claimDate) {
    return {
      status: 'SKIPPED',
      monthsElapsed: 0,
      finding: 'Missing policy inception or claim date.'
    };
  }

  const start = new Date(policyInceptionDate);
  const end = new Date(claimDate);
  const diffDays = (end - start) / (1000 * 60 * 60 * 24);
  const monthsElapsed = diffDays / 30.44;

  if (monthsElapsed >= 60.0) {
    return {
      status: 'FAIL',
      monthsElapsed,
      finding: `Claim occurred at ${monthsElapsed.toFixed(1)} months, exceeding the 60-month IRDAI moratorium. Rejection for non-disclosure or pre-existing condition is strictly prohibited by law.`,
      regulatoryCitation: 'IRDAI Health Insurance Regulations (60-Month Continuous Coverage Moratorium)'
    };
  }

  if (monthsElapsed > 36.0 && monthsElapsed < 60.0) {
    return {
      status: 'NEEDS_REVIEW',
      monthsElapsed,
      finding: `Claim occurred at ${monthsElapsed.toFixed(1)} months. Exceeds Section 45 Insurance Act 3-year incontestability period, but within 60-month window. Requires evidentiary review.`,
      regulatoryCitation: 'Insurance Act 1938, Section 45 (Incontestability after 3 years)'
    };
  }

  return {
    status: 'PASS',
    monthsElapsed,
    finding: `Claim occurred at ${monthsElapsed.toFixed(1)} months. Within legitimate 36-month contestability window.`
  };
}

/**
 * ELA Tamper Score Evaluator
 */
export function evaluateELATamperScore(score) {
  const cappedScore = Math.min(100, Math.max(0, score));
  if (cappedScore < 20.0) {
    return { score: cappedScore, assessment: 'CLEAN', risk: 'LOW' };
  } else if (cappedScore < 50.0) {
    return { score: cappedScore, assessment: 'SUSPICIOUS', risk: 'MEDIUM' };
  } else {
    return { score: cappedScore, assessment: 'HIGHLY_SUSPICIOUS', risk: 'HIGH' };
  }
}

/**
 * CGHS Tariff Anomaly Evaluator
 */
export function evaluateCGHSTariff(billedRate, cghsMaxBenchmark) {
  const ratio = billedRate / cghsMaxBenchmark;
  if (ratio > 3.0) {
    return { anomaly: true, severity: 'HIGH', ratio, message: `Billed rate ₹${billedRate} is ${ratio.toFixed(1)}x CGHS benchmark (₹${cghsMaxBenchmark}). Critical tariff inflation.` };
  } else if (ratio > 2.0) {
    return { anomaly: true, severity: 'MEDIUM', ratio, message: `Billed rate ₹${billedRate} is ${ratio.toFixed(1)}x CGHS benchmark (₹${cghsMaxBenchmark}). Moderate tariff deviation.` };
  } else {
    return { anomaly: false, severity: 'LOW', ratio, message: `Billed rate is within acceptable CGHS bounds.` };
  }
}

/**
 * Simple SHA-256 Mock Hash Chain Verifier
 */
export function verifyAuditHashChain(logs = []) {
  if (!logs || logs.length === 0) return { verified: true, count: 0 };

  for (let i = 0; i < logs.length; i++) {
    const current = logs[i];
    if (i > 0) {
      const previous = logs[i - 1];
      if (current.previous_hash !== previous.entry_hash) {
        return {
          verified: false,
          brokenIndex: i,
          error: `Hash chain broken at log index ${i}. Expected previous_hash "${previous.entry_hash}", got "${current.previous_hash}"`
        };
      }
    }
  }
  return { verified: true, count: logs.length };
}
