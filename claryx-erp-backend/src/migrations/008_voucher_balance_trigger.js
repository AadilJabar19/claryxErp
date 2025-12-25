exports.up = async function (knex) {
  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION check_voucher_balanced()
    RETURNS trigger AS $$
    DECLARE
      total_debit NUMERIC;
      total_credit NUMERIC;
    BEGIN
      IF NEW.is_posted = true THEN
        SELECT COALESCE(SUM(debit_amount), 0),
               COALESCE(SUM(credit_amount), 0)
        INTO total_debit, total_credit
        FROM voucher_lines
        WHERE voucher_id = NEW.id;

        IF total_debit <> total_credit THEN
          RAISE EXCEPTION 'Voucher % is not balanced (Debit: %, Credit: %)',
            NEW.id, total_debit, total_credit;
        END IF;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.schema.raw(`
    CREATE TRIGGER trg_check_voucher_balanced
    BEFORE UPDATE ON vouchers
    FOR EACH ROW
    WHEN (OLD.is_posted = false AND NEW.is_posted = true)
    EXECUTE FUNCTION check_voucher_balanced();
  `);
};

exports.down = async function (knex) {
  await knex.schema.raw(`
    DROP TRIGGER IF EXISTS trg_check_voucher_balanced ON vouchers;
  `);

  await knex.schema.raw(`
    DROP FUNCTION IF EXISTS check_voucher_balanced;
  `);
};
