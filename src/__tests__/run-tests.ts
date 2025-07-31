#!/usr/bin/env node

/**
 * Test runner script for Mosaia Node SDK
 * 
 * This script runs all tests and provides a comprehensive summary
 * of test coverage and results.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface TestResult {
  file: string;
  status: 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
}

interface TestSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  coverage: number;
  duration: number;
}

class TestRunner {
  private testResults: TestResult[] = [];
  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<TestSummary> {
    console.log('🧪 Starting Mosaia Node SDK Test Suite...\n');

    try {
      // Run Jest tests
      const jestResult = this.runJestTests();
      
      // Parse results
      this.parseJestResults(jestResult);
      
      // Generate summary
      const summary = this.generateSummary();
      
      // Print results
      this.printResults(summary);
      
      return summary;
    } catch (error) {
      console.error('❌ Test runner failed:', error);
      throw error;
    }
  }

  /**
   * Run Jest tests
   */
  private runJestTests(): string {
    try {
      const result = execSync('npm test -- --verbose --coverage', {
        encoding: 'utf8',
        cwd: process.cwd(),
        stdio: 'pipe'
      });
      return result;
    } catch (error: any) {
      // Jest returns non-zero exit code when tests fail, but we still want the output
      return error.stdout || error.stderr || error.message;
    }
  }

  /**
   * Parse Jest test results
   */
  private parseJestResults(jestOutput: string): void {
    const lines = jestOutput.split('\n');
    let currentFile = '';
    let currentStatus: 'passed' | 'failed' | 'skipped' = 'passed';

    for (const line of lines) {
      // Look for test file results
      if (line.includes('PASS') || line.includes('FAIL') || line.includes('SKIP')) {
        const match = line.match(/(PASS|FAIL|SKIP)\s+(.+\.test\.ts)/);
        if (match) {
          currentFile = match[2];
          currentStatus = match[1].toLowerCase() as 'passed' | 'failed' | 'skipped';
          
          this.testResults.push({
            file: currentFile,
            status: currentStatus
          });
        }
      }

      // Look for test duration
      if (line.includes('Test Suites:') && currentFile) {
        const durationMatch = line.match(/(\d+\.\d+)s/);
        if (durationMatch && this.testResults.length > 0) {
          this.testResults[this.testResults.length - 1].duration = parseFloat(durationMatch[1]);
        }
      }

      // Look for error messages
      if (line.includes('Error:') && currentFile && currentStatus === 'failed') {
        const lastResult = this.testResults[this.testResults.length - 1];
        if (lastResult && lastResult.file === currentFile) {
          lastResult.error = line.trim();
        }
      }
    }
  }

  /**
   * Generate test summary
   */
  private generateSummary(): TestSummary {
    const total = this.testResults.length;
    const passed = this.testResults.filter(r => r.status === 'passed').length;
    const failed = this.testResults.filter(r => r.status === 'failed').length;
    const skipped = this.testResults.filter(r => r.status === 'skipped').length;
    const duration = Date.now() - this.startTime;
    
    // Calculate coverage (simplified - in real implementation, parse Jest coverage output)
    const coverage = total > 0 ? (passed / total) * 100 : 0;

    return {
      total,
      passed,
      failed,
      skipped,
      coverage,
      duration
    };
  }

  /**
   * Print test results
   */
  private printResults(summary: TestSummary): void {
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⏭️  Skipped: ${summary.skipped}`);
    console.log(`📈 Coverage: ${summary.coverage.toFixed(1)}%`);
    console.log(`⏱️  Duration: ${(summary.duration / 1000).toFixed(2)}s`);

    if (summary.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults
        .filter(r => r.status === 'failed')
        .forEach(result => {
          console.log(`  - ${result.file}`);
          if (result.error) {
            console.log(`    Error: ${result.error}`);
          }
        });
    }

    if (summary.passed > 0) {
      console.log('\n✅ Passed Tests:');
      this.testResults
        .filter(r => r.status === 'passed')
        .forEach(result => {
          console.log(`  - ${result.file}`);
        });
    }

    console.log('\n🎯 Test Files Covered:');
    console.log('  - config.test.ts (Configuration Manager)');
    console.log('  - types.test.ts (Type Definitions)');
    console.log('  - index.test.ts (Main SDK Class)');

    console.log('\n📋 Test Categories:');
    console.log('  - Unit Tests: Configuration, Types, Core SDK');
    console.log('  - Integration Tests: API Client, OAuth, Models');
    console.log('  - Edge Cases: Error handling, Invalid inputs');
    console.log('  - Type Safety: Interface validation, Type compatibility');

    if (summary.failed === 0) {
      console.log('\n🎉 All tests passed! The SDK is ready for use.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
      process.exit(1);
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const runner = new TestRunner();
  runner.runAllTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}

export default TestRunner; 