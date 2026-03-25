/**
 * Security Header Auditor
 * OWASP ASVS Level 1 Compliance Checker
 */

import type { SecurityHeader, SecurityAuditResult } from './types.js';

const OWASP_ASVS_REQUIREMENTS = {
  'Content-Security-Policy': {
    required: true,
    pattern: /default-src\s+'self'/i,
    message: 'CSP should restrict default-src to self',
  },
  'Strict-Transport-Security': {
    required: false,
    pattern: /max-age=/i,
    message: 'HSTS recommended for production (HTTPS enforced)',
  },
  'X-Content-Type-Options': {
    required: true,
    pattern: /nosniff/i,
    message: 'X-Content-Type-Options must be nosniff',
  },
  'X-Frame-Options': {
    required: true,
    pattern: /(DENY|SAMEORIGIN)/i,
    message: 'X-Frame-Options should be DENY or SAMEORIGIN',
  },
  'X-XSS-Protection': {
    required: false,
    pattern: /1;\s*mode=block/i,
    message: 'X-XSS-Protection recommended (legacy browsers)',
  },
};

export class SecurityAuditor {
  /**
   * Audit response headers for OWASP ASVS compliance
   */
  public static audit(
    url: string,
    headers: Record<string, string>,
  ): SecurityAuditResult {
    const auditHeaders: SecurityHeader[] = [];
    const warnings: string[] = [];
    let overallCompliant = true;

    // Check each OWASP header
    for (const [headerName, requirement] of Object.entries(
      OWASP_ASVS_REQUIREMENTS,
    )) {
      const headerValue = headers[headerName.toLowerCase()] || null;
      const isCompliant = this.checkCompliance(headerValue, requirement);

      if (!isCompliant && requirement.required) {
        overallCompliant = false;
      }

      auditHeaders.push({
        name: headerName,
        value: headerValue,
        compliant: isCompliant,
        standard: this.getStandard(headerName),
        severity: this.getSeverity(
          headerName,
          isCompliant,
          requirement.required,
        ),
        message: requirement.message,
      });

      if (!isCompliant) {
        warnings.push(`${headerName}: ${requirement.message}`);
      }
    }

    // Check for additional security concerns
    const csp = headers['content-security-policy'];
    if (csp && csp.includes("'unsafe-inline'")) {
      warnings.push(
        "CSP contains 'unsafe-inline' - consider using nonces for scripts",
      );
      overallCompliant = false;
    }

    if (csp && csp.includes('*')) {
      warnings.push('CSP contains wildcard (*) - too permissive');
      overallCompliant = false;
    }

    return {
      timestamp: Date.now(),
      url,
      headers: auditHeaders,
      overallCompliant,
      warnings,
    };
  }

  /**
   * Check if header value complies with requirement
   */
  private static checkCompliance(
    headerValue: string | null,
    requirement: { required: boolean; pattern?: RegExp },
  ): boolean {
    if (!headerValue) {
      return !requirement.required;
    }

    if (requirement.pattern) {
      return requirement.pattern.test(headerValue);
    }

    return true;
  }

  /**
   * Determine header severity level
   */
  private static getSeverity(
    headerName: string,
    compliant: boolean,
    required: boolean,
  ): 'error' | 'warning' | 'info' {
    if (!compliant && required) return 'error';
    if (!compliant && !required) return 'warning';
    return 'info';
  }

  /**
   * Map header to OWASP standard
   */
  private static getStandard(
    headerName: string,
  ): 'CSP' | 'HSTS' | 'X-Frame-Options' | 'X-Content-Type-Options' | 'OTHER' {
    if (headerName.includes('CSP')) return 'CSP';
    if (headerName.includes('HSTS') || headerName.includes('Strict'))
      return 'HSTS';
    if (headerName.includes('X-Frame')) return 'X-Frame-Options';
    if (headerName.includes('X-Content')) return 'X-Content-Type-Options';
    return 'OTHER';
  }

  /**
   * Generate compliance report
   */
  public static generateReport(audits: SecurityAuditResult[]): {
    passRate: number;
    criticalIssues: string[];
    recommendations: string[];
  } {
    const totalChecks = audits.length * 5;
    const passedChecks = audits.reduce(
      (sum, audit) =>
        sum +
        audit.headers.filter((h) => h.compliant && h.severity !== 'info')
          .length,
      0,
    );

    const criticalIssues = audits
      .flatMap((a) =>
        a.headers.filter((h) => h.severity === 'error').map((h) => h.message),
      )
      .filter((v, i, a) => a.indexOf(v) === i); // Dedupe

    const recommendations = audits
      .flatMap((a) => a.warnings)
      .filter((v, i, a) => a.indexOf(v) === i); // Dedupe

    return {
      passRate: (passedChecks / totalChecks) * 100,
      criticalIssues,
      recommendations,
    };
  }
}
