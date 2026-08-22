"""create tax master table

Revision ID: c1f59bb7f102
Revises: c1f59bb7f101
Create Date: 2026-07-30 18:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'c1f59bb7f102'
down_revision = 'c1f59bb7f101'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'tax_masters',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('tax_name', sa.String(), nullable=False),
        sa.Column('tax_code', sa.String(), nullable=False),
        sa.Column('country', sa.String(), nullable=False),
        sa.Column('state', sa.String(), nullable=True),
        sa.Column('tax_type', sa.String(), nullable=False),
        sa.Column('tax_percentage', sa.Float(), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('effective_from', sa.DateTime(), nullable=False),
        sa.Column('effective_to', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tax_masters_id'), 'tax_masters', ['id'], unique=False)
    op.create_index(op.f('ix_tax_masters_tax_code'), 'tax_masters', ['tax_code'], unique=False)
    op.create_index(op.f('ix_tax_masters_country'), 'tax_masters', ['country'], unique=False)
    op.create_index(op.f('ix_tax_masters_state'), 'tax_masters', ['state'], unique=False)
    op.create_index(op.f('ix_tax_masters_is_active'), 'tax_masters', ['is_active'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_tax_masters_is_active'), table_name='tax_masters')
    op.drop_index(op.f('ix_tax_masters_state'), table_name='tax_masters')
    op.drop_index(op.f('ix_tax_masters_country'), table_name='tax_masters')
    op.drop_index(op.f('ix_tax_masters_tax_code'), table_name='tax_masters')
    op.drop_index(op.f('ix_tax_masters_id'), table_name='tax_masters')
    op.drop_table('tax_masters')
