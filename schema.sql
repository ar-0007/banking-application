-- Review before running. Run only if these tables do not already exist.
CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(30) UNIQUE NOT NULL,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    currency VARCHAR(3) NOT NULL DEFAULT 'PKR',
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (balance >= 0),
    CHECK (status IN ('active', 'blocked', 'pending', 'closed'))
);

CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    sender_account_id UUID NOT NULL REFERENCES accounts(id),
    receiver_account_id UUID NOT NULL REFERENCES accounts(id),
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'PKR',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    transaction_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    CHECK (amount > 0),
    CHECK (sender_account_id <> receiver_account_id),
    CHECK (transaction_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))
);

CREATE TABLE refunds (
    id UUID PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    amount DECIMAL(15, 2) NOT NULL,
    reason VARCHAR(255),
    refund_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (amount > 0),
    CHECK (refund_status IN ('pending', 'completed', 'failed'))
);

CREATE TABLE idempotency (
    idempotency_key VARCHAR(255) PRIMARY KEY,
    transaction_id UUID REFERENCES transactions(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cancellations (
    id UUID PRIMARY KEY,
    transaction_id UUID NOT NULL REFERENCES transactions(id),
    reason VARCHAR(255) NOT NULL,
    cancellation_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (cancellation_status IN ('pending', 'approved', 'rejected', 'completed'))
);

CREATE INDEX idx_transaction_sender ON transactions(sender_account_id);
CREATE INDEX idx_transaction_receiver ON transactions(receiver_account_id);
CREATE INDEX idx_transaction_created_at ON transactions(created_at);
CREATE INDEX idx_refund_transaction ON refunds(transaction_id);
CREATE INDEX idx_cancellation_transaction ON cancellations(transaction_id);
