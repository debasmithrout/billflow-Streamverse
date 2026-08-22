from app.core.database import engine, Base
from sqlalchemy import text
from app.models.enums import RefundStatus
from app.models.refund import Refund
import app.models  # to ensure everything is registered

def apply_migrations():
    with engine.begin() as conn:
        # Add new enum values if they don't exist
        try:
            conn.execute(text("ALTER TYPE subscriptionstatus ADD VALUE IF NOT EXISTS 'CANCEL_AT_PERIOD_END';"))
            print("Added CANCEL_AT_PERIOD_END to subscriptionstatus")
        except Exception as e:
            print(f"Error altering subscriptionstatus: {e}")

        try:
            conn.execute(text("ALTER TYPE paymentstatus ADD VALUE IF NOT EXISTS 'REFUNDED';"))
            print("Added REFUNDED to paymentstatus")
        except Exception as e:
            print(f"Error altering paymentstatus: {e}")

        try:
            conn.execute(text("ALTER TYPE invoicestatus ADD VALUE IF NOT EXISTS 'REFUNDED';"))
            conn.execute(text("ALTER TYPE invoicestatus ADD VALUE IF NOT EXISTS 'PARTIALLY_REFUNDED';"))
            print("Added REFUNDED and PARTIALLY_REFUNDED to invoicestatus")
        except Exception as e:
            print(f"Error altering invoicestatus: {e}")

        # Add webhook log new columns
        try:
            conn.execute(text("ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0 NOT NULL;"))
            conn.execute(text("ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMP;"))
            conn.execute(text("ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS response_status INTEGER;"))
            conn.execute(text("ALTER TABLE webhook_logs ADD COLUMN IF NOT EXISTS response_body VARCHAR;"))
            print("Added new columns to webhook_logs")
        except Exception as e:
            print(f"Error altering webhook_logs: {e}")

        # Add refund gateway new columns
        try:
            conn.execute(text("ALTER TABLE refunds ADD COLUMN IF NOT EXISTS gateway_refund_id VARCHAR(128);"))
            conn.execute(text("ALTER TABLE refunds ADD COLUMN IF NOT EXISTS gateway_response JSON;"))
            print("Added new columns to refunds")
        except Exception as e:
            print(f"Error altering refunds: {e}")

        # Add proration columns to invoices
        try:
            conn.execute(text("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS proration_credit FLOAT DEFAULT 0.0;"))
            conn.execute(text("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS proration_debit FLOAT DEFAULT 0.0;"))
            print("Added proration columns to invoices")
        except Exception as e:
            print(f"Error altering invoices with proration columns: {e}")

        # Add region foundation columns to customers
        try:
            conn.execute(text("ALTER TABLE customers ADD COLUMN IF NOT EXISTS country_code VARCHAR DEFAULT 'IN' NOT NULL;"))
            conn.execute(text("ALTER TABLE customers ADD COLUMN IF NOT EXISTS currency_code VARCHAR DEFAULT 'INR' NOT NULL;"))
            conn.execute(text("ALTER TABLE customers ADD COLUMN IF NOT EXISTS locale VARCHAR DEFAULT 'en-IN' NOT NULL;"))
            conn.execute(text("ALTER TABLE customers ADD COLUMN IF NOT EXISTS timezone VARCHAR DEFAULT 'Asia/Kolkata' NOT NULL;"))
            conn.execute(text("ALTER TABLE customers ADD COLUMN IF NOT EXISTS tax_region VARCHAR DEFAULT 'GST' NOT NULL;"))
            print("Added region foundation columns to customers table")
        except Exception as e:
            print(f"Error altering customers with region columns: {e}")

        # Add currency_code to payments and invoices
        try:
            conn.execute(text("ALTER TABLE payments ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3) DEFAULT 'INR' NOT NULL;"))
            conn.execute(text("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3) DEFAULT 'INR' NOT NULL;"))
            print("Added currency_code to payments and invoices tables")
        except Exception as e:
            print(f"Error adding currency_code to payments/invoices: {e}")

        # Add billing contract columns to subscriptions
        try:
            conn.execute(text("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3) DEFAULT 'INR' NOT NULL;"))
            conn.execute(text("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_price FLOAT DEFAULT 0.0 NOT NULL;"))
            conn.execute(text("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_interval VARCHAR(20) DEFAULT 'Monthly' NOT NULL;"))
            conn.execute(text("ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_price_id INTEGER;"))
            print("Added billing contract columns to subscriptions table")
        except Exception as e:
            print(f"Error altering subscriptions table: {e}")

        # Add B2B tax columns to customers
        try:
            conn.execute(text("ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_name VARCHAR;"))
            conn.execute(text("ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_tax_id VARCHAR;"))
            conn.execute(text("ALTER TABLE customers ADD COLUMN IF NOT EXISTS tax_exempt BOOLEAN DEFAULT false NOT NULL;"))
            print("Added B2B tax columns to customers table")
        except Exception as e:
            print(f"Error altering customers table: {e}")

        # Add SaaS tax columns to invoices
        try:
            conn.execute(text("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_name VARCHAR DEFAULT 'GST' NOT NULL;"))
            conn.execute(text("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_code VARCHAR DEFAULT 'GST' NOT NULL;"))
            conn.execute(text("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_percentage FLOAT DEFAULT 18.0 NOT NULL;"))
            conn.execute(text("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_amount FLOAT DEFAULT 0.0 NOT NULL;"))
            print("Added SaaS tax columns to invoices table")
        except Exception as e:
            print(f"Error altering invoices table: {e}")

        # Add reverse_charge to tax_masters
        try:
            conn.execute(text("ALTER TABLE tax_masters ADD COLUMN IF NOT EXISTS reverse_charge BOOLEAN DEFAULT false NOT NULL;"))
            print("Added reverse_charge column to tax_masters table")
        except Exception as e:
            print(f"Error altering tax_masters table: {e}")

        # Add exchange rate and base currency columns to invoices
        try:
            conn.execute(text("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS exchange_rate FLOAT DEFAULT 1.0 NOT NULL;"))
            conn.execute(text("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS base_currency VARCHAR(3) DEFAULT 'INR' NOT NULL;"))
            print("Added exchange_rate and base_currency to invoices table")
        except Exception as e:
            print(f"Error altering invoices table with currency columns: {e}")

        # Add exchange rate and base currency columns to payments
        try:
            conn.execute(text("ALTER TABLE payments ADD COLUMN IF NOT EXISTS exchange_rate FLOAT DEFAULT 1.0 NOT NULL;"))
            conn.execute(text("ALTER TABLE payments ADD COLUMN IF NOT EXISTS base_currency VARCHAR(3) DEFAULT 'INR' NOT NULL;"))
            print("Added exchange_rate and base_currency to payments table")
        except Exception as e:
            print(f"Error altering payments table with currency columns: {e}")

    # Create new tables (like plan_prices and refunds)
    print("Creating new tables...")
    Base.metadata.create_all(bind=engine)

    # Seed default system settings
    with engine.begin() as conn:
        try:
            existing = conn.execute(text("SELECT id FROM system_settings WHERE key = 'reporting_base_currency';")).fetchone()
            if not existing:
                conn.execute(text(
                    "INSERT INTO system_settings (key, value, created_at, updated_at) "
                    "VALUES ('reporting_base_currency', 'INR', now(), now());"
                ))
                print("Seeded default reporting_base_currency setting")
        except Exception as e:
            print(f"Error seeding default system settings: {e}")

    # Data migration for plan prices and database partial unique index
    with engine.begin() as conn:
        # Add partial unique index on plan_prices to enforce single active default price
        try:
            conn.execute(text(
                "CREATE UNIQUE INDEX IF NOT EXISTS unique_default_plan_price ON plan_prices (plan_id, billing_interval) WHERE (is_default = true AND is_active = true);"
            ))
            print("Created unique index for default plan price rule")
        except Exception as e:
            print(f"Error creating unique index for default plan price: {e}")

        try:
            # Check if plan_prices is empty
            count = conn.execute(text("SELECT COUNT(*) FROM plan_prices;")).scalar()
            if count == 0:
                print("Migrating existing plan prices to plan_prices table...")
                # Select existing plans
                plans = conn.execute(text("SELECT id, price, billing_interval FROM plans;")).fetchall()
                for p_id, price, interval in plans:
                    conn.execute(text(
                        "INSERT INTO plan_prices (plan_id, currency_code, price, billing_interval, is_default, is_active, created_at, updated_at) "
                        "VALUES (:plan_id, 'INR', :price, :interval, true, true, now(), now());"
                    ), {"plan_id": p_id, "price": price, "interval": interval})
                print("Plan prices migration completed successfully.")
        except Exception as e:
            print(f"Error during plan prices data migration: {e}")

    # Data migration for subscription contract fields
    with engine.begin() as conn:
        try:
            # Check if any subscriptions have plan_price_id as NULL
            subs = conn.execute(text("SELECT id, plan_id FROM subscriptions WHERE plan_price_id IS NULL;")).fetchall()
            if subs:
                print(f"Backfilling {len(subs)} subscriptions with billing contract properties...")
                for sub_id, plan_id in subs:
                    # Find the default INR plan_price for this plan
                    price_row = conn.execute(text(
                        "SELECT id, price, billing_interval FROM plan_prices WHERE plan_id = :plan_id AND currency_code = 'INR' LIMIT 1;"
                    ), {"plan_id": plan_id}).fetchone()
                    
                    if price_row:
                        p_id, price, interval = price_row
                        conn.execute(text(
                            "UPDATE subscriptions SET plan_price_id = :plan_price_id, billing_price = :billing_price, "
                            "billing_interval = :billing_interval, currency_code = 'INR' WHERE id = :sub_id;"
                        ), {"plan_price_id": p_id, "billing_price": price, "billing_interval": interval, "sub_id": sub_id})
                    else:
                        # Fallback to plan table price directly if no plan_price row was found
                        plan_row = conn.execute(text(
                            "SELECT price, billing_interval FROM plans WHERE id = :plan_id;"
                        ), {"plan_id": plan_id}).fetchone()
                        if plan_row:
                            price, interval = plan_row
                            # Create a default plan price entry first
                            conn.execute(text(
                                "INSERT INTO plan_prices (plan_id, currency_code, price, billing_interval, is_default, is_active, created_at, updated_at) "
                                "VALUES (:plan_id, 'INR', :price, :interval, true, true, now(), now());"
                            ), {"plan_id": plan_id, "price": price, "interval": interval})
                            p_id = conn.execute(text("SELECT id FROM plan_prices WHERE plan_id = :plan_id AND currency_code = 'INR' LIMIT 1;"), {"plan_id": plan_id}).scalar()
                            
                            conn.execute(text(
                                "UPDATE subscriptions SET plan_price_id = :plan_price_id, billing_price = :billing_price, "
                                "billing_interval = :billing_interval, currency_code = 'INR' WHERE id = :sub_id;"
                            ), {"plan_price_id": p_id, "billing_price": price, "billing_interval": interval, "sub_id": sub_id})
                print("Subscription contract backfill completed successfully.")
        except Exception as e:
            print(f"Error during subscriptions contract backfill: {e}")

    print("Database migrations applied successfully!")

if __name__ == "__main__":
    apply_migrations()
