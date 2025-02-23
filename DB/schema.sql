-- public.charge_log definition

-- Drop table

-- DROP TABLE charge_log;

CREATE TABLE charge_log (
	id serial4 NOT NULL,
	oper_time timestamp(3) NOT NULL,
	partner_name varchar(32) NULL,
	change_number int4 NULL,
	balance_before int4 NULL, -- 变更前余额
	balance_after int4 NULL, -- 变更前余额
	CONSTRAINT charge_log_pkey PRIMARY KEY (id)
);

-- Column comments

COMMENT ON COLUMN public.charge_log.balance_before IS '变更前余额';
COMMENT ON COLUMN public.charge_log.balance_after IS '变更前余额';


-- public.oper_log definition

-- Drop table

-- DROP TABLE oper_log;

CREATE TABLE oper_log (
	id serial4 NOT NULL,
	oper_name varchar(32) NOT NULL,
	oper_time timestamp(3) NOT NULL,
	cdk_value varchar(32) NULL,
	oper_type varchar(16) NULL,
	balance int4 NULL, -- 余额
	CONSTRAINT oper_log_pkey PRIMARY KEY (id)
);

-- Column comments

COMMENT ON COLUMN public.oper_log.balance IS '余额';


-- public.partner_score definition

-- Drop table

-- DROP TABLE partner_score;

CREATE TABLE partner_score (
	partner_name varchar NOT NULL,
	balance int4 DEFAULT 0 NOT NULL, -- 余额
	CONSTRAINT partner_score_pk PRIMARY KEY (partner_name)
);

-- Column comments

COMMENT ON COLUMN public.partner_score.balance IS '余额';