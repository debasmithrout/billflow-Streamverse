"""create retry tables

Revision ID: c1f59bb7f101
Revises: 
Create Date: 2026-07-30 17:50:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'c1f59bb7f101'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # 1. Create retry_configurations table
    op.create_table(
        'retry_configurations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('retry_attempt', sa.Integer(), nullable=False),
        sa.Column('retry_after_days', sa.Integer(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('retry_attempt')
    )
    op.create_index(op.f('ix_retry_configurations_id'), 'retry_configurations', ['id'], unique=False)

    # Seed default values
    op.execute(
        "INSERT INTO retry_configurations (retry_attempt, retry_after_days, is_active, created_at, updated_at) VALUES "
        "(1, 1, true, now(), now()), "
        "(2, 3, true, now(), now()), "
        "(3, 7, true, now(), now())"
    )

    # 2. Create RetryStatus enum type in postgres
    retry_status_enum = sa.Enum('PENDING', 'SUCCESS', 'FAILED', name='retrystatus')
    retry_status_enum.create(op.get_bind(), checkfirst=True)

    # 3. Create retry_queues table
    op.create_table(
        'retry_queues',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('customer_id', sa.Integer(), nullable=False),
        sa.Column('subscription_id', sa.Integer(), nullable=False),
        sa.Column('invoice_id', sa.Integer(), nullable=False),
        sa.Column('payment_id', sa.Integer(), nullable=False),
        sa.Column('retry_attempt', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('retry_status', sa.Enum('PENDING', 'SUCCESS', 'FAILED', name='retrystatus'), nullable=False, server_default='PENDING'),
        sa.Column('scheduled_retry_date', sa.DateTime(), nullable=False),
        sa.Column('actual_retry_date', sa.DateTime(), nullable=True),
        sa.Column('next_retry_date', sa.DateTime(), nullable=True),
        sa.Column('failure_reason', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['customer_id'], ['customers.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['subscription_id'], ['subscriptions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['invoice_id'], ['invoices.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['payment_id'], ['payments.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_retry_queues_id'), 'retry_queues', ['id'], unique=False)
    op.create_index(op.f('ix_retry_queues_customer_id'), 'retry_queues', ['customer_id'], unique=False)
    op.create_index(op.f('ix_retry_queues_subscription_id'), 'retry_queues', ['subscription_id'], unique=False)
    op.create_index(op.f('ix_retry_queues_invoice_id'), 'retry_queues', ['invoice_id'], unique=False)
    op.create_index(op.f('ix_retry_queues_payment_id'), 'retry_queues', ['payment_id'], unique=False)
    op.create_index(op.f('ix_retry_queues_retry_status'), 'retry_queues', ['retry_status'], unique=False)
    op.create_index(op.f('ix_retry_queues_scheduled_retry_date'), 'retry_queues', ['scheduled_retry_date'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_retry_queues_scheduled_retry_date'), table_name='retry_queues')
    op.drop_index(op.f('ix_retry_queues_retry_status'), table_name='retry_queues')
    op.drop_index(op.f('ix_retry_queues_payment_id'), table_name='retry_queues')
    op.drop_index(op.f('ix_retry_queues_invoice_id'), table_name='retry_queues')
    op.drop_index(op.f('ix_retry_queues_subscription_id'), table_name='retry_queues')
    op.drop_index(op.f('ix_retry_queues_customer_id'), table_name='retry_queues')
    op.drop_index(op.f('ix_retry_queues_id'), table_name='retry_queues')
    op.drop_table('retry_queues')
    
    # Drop enum type
    retry_status_enum = sa.Enum('PENDING', 'SUCCESS', 'FAILED', name='retrystatus')
    retry_status_enum.drop(op.get_bind(), checkfirst=True)

    op.drop_index(op.f('ix_retry_configurations_id'), table_name='retry_configurations')
    op.drop_table('retry_configurations')
