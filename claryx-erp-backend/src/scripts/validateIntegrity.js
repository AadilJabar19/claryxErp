const db = require('../config/database');

class IntegrityValidator {
  static async validateAll() {
    console.log('🔍 Starting accounting integrity validation...\n');
    
    const results = {
      voucherBalance: await this.validateVoucherBalance(),
      reversedVouchers: await this.validateReversedVouchers(),
      periodLocks: await this.validatePeriodLocks()
    };
    
    this.printSummary(results);
    process.exit(0);
  }

  static async validateVoucherBalance() {
    console.log('1️⃣ Validating voucher balance...');
    
    const [unbalanced] = await db.execute(`
      SELECT v.id, v.voucher_number, v.company_id,
        SUM(vl.debit_amount) as total_debit,
        SUM(vl.credit_amount) as total_credit,
        ABS(SUM(vl.debit_amount) - SUM(vl.credit_amount)) as difference
      FROM vouchers v
      JOIN voucher_lines vl ON v.id = vl.voucher_id
      WHERE v.status = 'posted' AND v.is_reversed = false
      GROUP BY v.id
      HAVING ABS(SUM(vl.debit_amount) - SUM(vl.credit_amount)) > 0.01
    `);

    if (unbalanced.length === 0) {
      console.log('✅ All vouchers are balanced\n');
      return { passed: true, count: 0 };
    }

    console.log(`❌ Found ${unbalanced.length} unbalanced vouchers:`);
    unbalanced.forEach(v => {
      console.log(`   - ${v.voucher_number}: Debit=${v.total_debit}, Credit=${v.total_credit}, Diff=${v.difference}`);
    });
    console.log();

    return { passed: false, count: unbalanced.length, details: unbalanced };
  }

  static async validateReversedVouchers() {
    console.log('2️⃣ Validating reversed vouchers exclusion...');
    
    const [reversedInReports] = await db.execute(`
      SELECT v.id, v.voucher_number, v.company_id
      FROM vouchers v
      WHERE v.is_reversed = true AND v.status = 'posted'
      LIMIT 10
    `);

    if (reversedInReports.length === 0) {
      console.log('✅ No reversed vouchers found in active status\n');
      return { passed: true, count: 0 };
    }

    console.log(`⚠️ Found ${reversedInReports.length} reversed vouchers still marked as posted:`);
    reversedInReports.forEach(v => {
      console.log(`   - ${v.voucher_number} (ID: ${v.id})`);
    });
    console.log();

    return { passed: false, count: reversedInReports.length, details: reversedInReports };
  }

  static async validatePeriodLocks() {
    console.log('3️⃣ Validating period locks...');
    
    const [violations] = await db.execute(`
      SELECT v.id, v.voucher_number, v.voucher_date, v.company_id, pl.locked_until
      FROM vouchers v
      JOIN period_locks pl ON v.company_id = pl.company_id
      WHERE v.status = 'posted' 
        AND v.voucher_date <= pl.locked_until
        AND v.created_at > pl.created_at
      LIMIT 10
    `);

    if (violations.length === 0) {
      console.log('✅ No period lock violations found\n');
      return { passed: true, count: 0 };
    }

    console.log(`❌ Found ${violations.length} period lock violations:`);
    violations.forEach(v => {
      console.log(`   - ${v.voucher_number} dated ${v.voucher_date} (locked until ${v.locked_until})`);
    });
    console.log();

    return { passed: false, count: violations.length, details: violations };
  }

  static printSummary(results) {
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    
    const allPassed = Object.values(results).every(r => r.passed);
    const totalIssues = Object.values(results).reduce((sum, r) => sum + r.count, 0);
    
    console.log(`Overall Status: ${allPassed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Total Issues: ${totalIssues}`);
    console.log();
    
    Object.entries(results).forEach(([test, result]) => {
      console.log(`${result.passed ? '✅' : '❌'} ${test}: ${result.count} issues`);
    });
    
    if (!allPassed) {
      console.log('\n⚠️ Please review and fix the identified issues.');
    }
  }
}

if (require.main === module) {
  IntegrityValidator.validateAll().catch(console.error);
}

module.exports = IntegrityValidator;