-- Schema
--
-- PostgreSQL database dump
--

-- Dumped from database version 17.10 (4f20678)
-- Dumped by pg_dump version 17.10 (4f20678)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.account (
    id text NOT NULL,
    "userId" text NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "accessTokenExpiresAt" timestamp without time zone,
    "refreshTokenExpiresAt" timestamp without time zone,
    scope text,
    "idToken" text,
    password text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.account OWNER TO neondb_owner;

--
-- Name: admin_notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_notifications (
    id integer NOT NULL,
    user_id text NOT NULL,
    user_name text DEFAULT ''::text NOT NULL,
    user_email text DEFAULT ''::text NOT NULL,
    event_type text NOT NULL,
    plan_name text DEFAULT ''::text NOT NULL,
    plan_id integer,
    amount numeric(10,2) DEFAULT 0,
    platform text DEFAULT 'web'::text,
    status text DEFAULT 'unread'::text,
    details jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.admin_notifications OWNER TO neondb_owner;

--
-- Name: admin_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.admin_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_notifications_id_seq OWNER TO neondb_owner;

--
-- Name: admin_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.admin_notifications_id_seq OWNED BY public.admin_notifications.id;


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.app_settings (
    key text NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.app_settings OWNER TO neondb_owner;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.categories OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO neondb_owner;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: content_access_log; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.content_access_log (
    id integer NOT NULL,
    user_id text NOT NULL,
    content_type text NOT NULL,
    content_id integer NOT NULL,
    accessed_date date DEFAULT CURRENT_DATE NOT NULL
);


ALTER TABLE public.content_access_log OWNER TO neondb_owner;

--
-- Name: content_access_log_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.content_access_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.content_access_log_id_seq OWNER TO neondb_owner;

--
-- Name: content_access_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.content_access_log_id_seq OWNED BY public.content_access_log.id;


--
-- Name: content_pages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.content_pages (
    slug text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.content_pages OWNER TO neondb_owner;

--
-- Name: daily_challenge_questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.daily_challenge_questions (
    id integer NOT NULL,
    challenge_id integer NOT NULL,
    question text NOT NULL,
    options jsonb DEFAULT '["", "", "", ""]'::jsonb NOT NULL,
    correct_index integer DEFAULT 0 NOT NULL,
    reason text DEFAULT ''::text,
    enabled boolean DEFAULT true
);


ALTER TABLE public.daily_challenge_questions OWNER TO neondb_owner;

--
-- Name: daily_challenge_questions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.daily_challenge_questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_challenge_questions_id_seq OWNER TO neondb_owner;

--
-- Name: daily_challenge_questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.daily_challenge_questions_id_seq OWNED BY public.daily_challenge_questions.id;


--
-- Name: daily_challenges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.daily_challenges (
    id integer NOT NULL,
    title text NOT NULL,
    description text DEFAULT ''::text,
    quiz_duration integer DEFAULT 30,
    total_questions integer DEFAULT 5,
    shuffle_questions boolean DEFAULT true,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.daily_challenges OWNER TO neondb_owner;

--
-- Name: daily_challenges_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.daily_challenges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_challenges_id_seq OWNER TO neondb_owner;

--
-- Name: daily_challenges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.daily_challenges_id_seq OWNED BY public.daily_challenges.id;


--
-- Name: help_topics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.help_topics (
    id integer NOT NULL,
    title text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.help_topics OWNER TO neondb_owner;

--
-- Name: help_topics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.help_topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.help_topics_id_seq OWNER TO neondb_owner;

--
-- Name: help_topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.help_topics_id_seq OWNED BY public.help_topics.id;


--
-- Name: infographics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.infographics (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    thumbnail_url text,
    file_url text,
    is_premium boolean DEFAULT false
);


ALTER TABLE public.infographics OWNER TO neondb_owner;

--
-- Name: infographics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.infographics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.infographics_id_seq OWNER TO neondb_owner;

--
-- Name: infographics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.infographics_id_seq OWNED BY public.infographics.id;


--
-- Name: issue_reports; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.issue_reports (
    id integer NOT NULL,
    user_id text NOT NULL,
    user_name text DEFAULT ''::text NOT NULL,
    user_email text DEFAULT ''::text NOT NULL,
    subject text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'open'::text,
    is_read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.issue_reports OWNER TO neondb_owner;

--
-- Name: issue_reports_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.issue_reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.issue_reports_id_seq OWNER TO neondb_owner;

--
-- Name: issue_reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.issue_reports_id_seq OWNED BY public.issue_reports.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.questions (
    id integer NOT NULL,
    topic_id integer,
    question text NOT NULL,
    options jsonb NOT NULL,
    correct_index integer NOT NULL,
    reason text DEFAULT ''::text,
    enabled boolean DEFAULT true
);


ALTER TABLE public.questions OWNER TO neondb_owner;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.questions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_id_seq OWNER TO neondb_owner;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: quiz_attempts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.quiz_attempts (
    id integer NOT NULL,
    user_id text NOT NULL,
    topic_id integer,
    score integer DEFAULT 0 NOT NULL,
    total integer DEFAULT 0 NOT NULL,
    attempted_at timestamp with time zone DEFAULT now(),
    challenge_id integer
);


ALTER TABLE public.quiz_attempts OWNER TO neondb_owner;

--
-- Name: quiz_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.quiz_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quiz_attempts_id_seq OWNER TO neondb_owner;

--
-- Name: quiz_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.quiz_attempts_id_seq OWNED BY public.quiz_attempts.id;


--
-- Name: referral_codes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.referral_codes (
    id integer NOT NULL,
    user_id text NOT NULL,
    code text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.referral_codes OWNER TO neondb_owner;

--
-- Name: referral_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.referral_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.referral_codes_id_seq OWNER TO neondb_owner;

--
-- Name: referral_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.referral_codes_id_seq OWNED BY public.referral_codes.id;


--
-- Name: referrals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.referrals (
    id integer NOT NULL,
    referrer_user_id text NOT NULL,
    referred_user_id text NOT NULL,
    referral_code text NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.referrals OWNER TO neondb_owner;

--
-- Name: referrals_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.referrals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.referrals_id_seq OWNER TO neondb_owner;

--
-- Name: referrals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.referrals_id_seq OWNED BY public.referrals.id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    id text NOT NULL,
    "userId" text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: subscription_plans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subscription_plans (
    id integer NOT NULL,
    name text NOT NULL,
    price numeric(10,2) DEFAULT 0 NOT NULL,
    billing_period text DEFAULT 'month'::text NOT NULL,
    features jsonb DEFAULT '[]'::jsonb,
    is_featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    stripe_price_id text DEFAULT ''::text,
    paypal_plan_id text DEFAULT ''::text,
    rc_package_identifier text DEFAULT ''::text NOT NULL,
    apple_product_id text DEFAULT ''::text NOT NULL,
    google_product_id text DEFAULT ''::text NOT NULL
);


ALTER TABLE public.subscription_plans OWNER TO neondb_owner;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.subscription_plans_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.subscription_plans_id_seq OWNER TO neondb_owner;

--
-- Name: subscription_plans_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.subscription_plans_id_seq OWNED BY public.subscription_plans.id;


--
-- Name: topics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.topics (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    video_url text,
    category text,
    key_takeaways text[] DEFAULT '{}'::text[],
    quiz_duration integer DEFAULT 30,
    total_questions integer DEFAULT 5,
    shuffle_questions boolean DEFAULT true,
    video_orientation text DEFAULT 'horizontal'::text,
    thumbnail_url text DEFAULT ''::text,
    is_premium boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.topics OWNER TO neondb_owner;

--
-- Name: topics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.topics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.topics_id_seq OWNER TO neondb_owner;

--
-- Name: topics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.topics_id_seq OWNED BY public.topics.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "emailVerified" boolean DEFAULT false NOT NULL,
    image text,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    is_admin boolean DEFAULT false,
    phone text DEFAULT ''::text,
    state text DEFAULT ''::text,
    country text DEFAULT ''::text,
    favourite_subjects text[] DEFAULT '{}'::text[],
    is_active boolean DEFAULT true,
    is_premium boolean DEFAULT false,
    last_rc_check_at timestamp with time zone,
    wallet_balance numeric(10,2) DEFAULT 0
);


ALTER TABLE public."user" OWNER TO neondb_owner;

--
-- Name: user_progress; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_progress (
    user_id text NOT NULL,
    videos_watched integer DEFAULT 0,
    mcqs_answered integer DEFAULT 0,
    current_rank integer DEFAULT 5,
    streak_days integer DEFAULT 0,
    last_activity timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    last_activity_date date
);


ALTER TABLE public.user_progress OWNER TO neondb_owner;

--
-- Name: verification; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.verification (
    id text NOT NULL,
    identifier text NOT NULL,
    value text NOT NULL,
    "expiresAt" timestamp without time zone NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.verification OWNER TO neondb_owner;

--
-- Name: video_watches; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.video_watches (
    id integer NOT NULL,
    user_id text NOT NULL,
    topic_id integer NOT NULL,
    watched_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.video_watches OWNER TO neondb_owner;

--
-- Name: video_watches_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.video_watches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.video_watches_id_seq OWNER TO neondb_owner;

--
-- Name: video_watches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.video_watches_id_seq OWNED BY public.video_watches.id;


--
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.wallet_transactions (
    id integer NOT NULL,
    user_id text NOT NULL,
    amount numeric(10,2) NOT NULL,
    type text NOT NULL,
    reason text NOT NULL,
    reference_id text DEFAULT ''::text,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.wallet_transactions OWNER TO neondb_owner;

--
-- Name: wallet_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.wallet_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wallet_transactions_id_seq OWNER TO neondb_owner;

--
-- Name: wallet_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wallet_transactions_id_seq OWNED BY public.wallet_transactions.id;


--
-- Name: worksheets; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.worksheets (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    file_url text,
    is_premium boolean DEFAULT false
);


ALTER TABLE public.worksheets OWNER TO neondb_owner;

--
-- Name: worksheets_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.worksheets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.worksheets_id_seq OWNER TO neondb_owner;

--
-- Name: worksheets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.worksheets_id_seq OWNED BY public.worksheets.id;


--
-- Name: admin_notifications id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_notifications ALTER COLUMN id SET DEFAULT nextval('public.admin_notifications_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: content_access_log id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_access_log ALTER COLUMN id SET DEFAULT nextval('public.content_access_log_id_seq'::regclass);


--
-- Name: daily_challenge_questions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_challenge_questions ALTER COLUMN id SET DEFAULT nextval('public.daily_challenge_questions_id_seq'::regclass);


--
-- Name: daily_challenges id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_challenges ALTER COLUMN id SET DEFAULT nextval('public.daily_challenges_id_seq'::regclass);


--
-- Name: help_topics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.help_topics ALTER COLUMN id SET DEFAULT nextval('public.help_topics_id_seq'::regclass);


--
-- Name: infographics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.infographics ALTER COLUMN id SET DEFAULT nextval('public.infographics_id_seq'::regclass);


--
-- Name: issue_reports id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.issue_reports ALTER COLUMN id SET DEFAULT nextval('public.issue_reports_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: quiz_attempts id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_attempts ALTER COLUMN id SET DEFAULT nextval('public.quiz_attempts_id_seq'::regclass);


--
-- Name: referral_codes id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referral_codes ALTER COLUMN id SET DEFAULT nextval('public.referral_codes_id_seq'::regclass);


--
-- Name: referrals id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referrals ALTER COLUMN id SET DEFAULT nextval('public.referrals_id_seq'::regclass);


--
-- Name: subscription_plans id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscription_plans ALTER COLUMN id SET DEFAULT nextval('public.subscription_plans_id_seq'::regclass);


--
-- Name: topics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.topics ALTER COLUMN id SET DEFAULT nextval('public.topics_id_seq'::regclass);


--
-- Name: video_watches id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.video_watches ALTER COLUMN id SET DEFAULT nextval('public.video_watches_id_seq'::regclass);


--
-- Name: wallet_transactions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wallet_transactions ALTER COLUMN id SET DEFAULT nextval('public.wallet_transactions_id_seq'::regclass);


--
-- Name: worksheets id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.worksheets ALTER COLUMN id SET DEFAULT nextval('public.worksheets_id_seq'::regclass);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: admin_notifications admin_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_notifications
    ADD CONSTRAINT admin_notifications_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (key);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: content_access_log content_access_log_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_access_log
    ADD CONSTRAINT content_access_log_pkey PRIMARY KEY (id);


--
-- Name: content_pages content_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.content_pages
    ADD CONSTRAINT content_pages_pkey PRIMARY KEY (slug);


--
-- Name: daily_challenge_questions daily_challenge_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_challenge_questions
    ADD CONSTRAINT daily_challenge_questions_pkey PRIMARY KEY (id);


--
-- Name: daily_challenges daily_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_challenges
    ADD CONSTRAINT daily_challenges_pkey PRIMARY KEY (id);


--
-- Name: help_topics help_topics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.help_topics
    ADD CONSTRAINT help_topics_pkey PRIMARY KEY (id);


--
-- Name: infographics infographics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.infographics
    ADD CONSTRAINT infographics_pkey PRIMARY KEY (id);


--
-- Name: issue_reports issue_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.issue_reports
    ADD CONSTRAINT issue_reports_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: quiz_attempts quiz_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_pkey PRIMARY KEY (id);


--
-- Name: referral_codes referral_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referral_codes
    ADD CONSTRAINT referral_codes_code_key UNIQUE (code);


--
-- Name: referral_codes referral_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referral_codes
    ADD CONSTRAINT referral_codes_pkey PRIMARY KEY (id);


--
-- Name: referral_codes referral_codes_user_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referral_codes
    ADD CONSTRAINT referral_codes_user_id_key UNIQUE (user_id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_referred_user_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_user_id_key UNIQUE (referred_user_id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (id);


--
-- Name: session session_token_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_token_key UNIQUE (token);


--
-- Name: subscription_plans subscription_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscription_plans
    ADD CONSTRAINT subscription_plans_pkey PRIMARY KEY (id);


--
-- Name: topics topics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.topics
    ADD CONSTRAINT topics_pkey PRIMARY KEY (id);


--
-- Name: user user_email_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_key UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_progress user_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_progress
    ADD CONSTRAINT user_progress_pkey PRIMARY KEY (user_id);


--
-- Name: verification verification_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.verification
    ADD CONSTRAINT verification_pkey PRIMARY KEY (id);


--
-- Name: video_watches video_watches_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.video_watches
    ADD CONSTRAINT video_watches_pkey PRIMARY KEY (id);


--
-- Name: video_watches video_watches_user_id_topic_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.video_watches
    ADD CONSTRAINT video_watches_user_id_topic_id_key UNIQUE (user_id, topic_id);


--
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- Name: worksheets worksheets_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.worksheets
    ADD CONSTRAINT worksheets_pkey PRIMARY KEY (id);


--
-- Name: idx_account_provider; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_account_provider ON public.account USING btree ("providerId", "accountId");


--
-- Name: idx_account_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_account_user_id ON public.account USING btree ("userId");


--
-- Name: idx_admin_notifications_created; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_admin_notifications_created ON public.admin_notifications USING btree (created_at DESC);


--
-- Name: idx_admin_notifications_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_admin_notifications_status ON public.admin_notifications USING btree (status);


--
-- Name: idx_content_access_unique; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE UNIQUE INDEX idx_content_access_unique ON public.content_access_log USING btree (user_id, content_type, content_id, accessed_date);


--
-- Name: idx_content_access_user_date; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_content_access_user_date ON public.content_access_log USING btree (user_id, accessed_date);


--
-- Name: idx_daily_challenge_questions; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_daily_challenge_questions ON public.daily_challenge_questions USING btree (challenge_id);


--
-- Name: idx_issue_reports_is_read; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_issue_reports_is_read ON public.issue_reports USING btree (is_read);


--
-- Name: idx_issue_reports_status; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_issue_reports_status ON public.issue_reports USING btree (status);


--
-- Name: idx_quiz_attempts_challenge; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_quiz_attempts_challenge ON public.quiz_attempts USING btree (challenge_id);


--
-- Name: idx_quiz_attempts_user; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts USING btree (user_id);


--
-- Name: idx_referral_codes_code; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_referral_codes_code ON public.referral_codes USING btree (code);


--
-- Name: idx_session_token; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_session_token ON public.session USING btree (token);


--
-- Name: idx_session_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_session_user_id ON public.session USING btree ("userId");


--
-- Name: idx_video_watches_user; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_video_watches_user ON public.video_watches USING btree (user_id);


--
-- Name: idx_wallet_user_id; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX idx_wallet_user_id ON public.wallet_transactions USING btree (user_id);


--
-- Name: account account_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: daily_challenge_questions daily_challenge_questions_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_challenge_questions
    ADD CONSTRAINT daily_challenge_questions_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.daily_challenges(id) ON DELETE CASCADE;


--
-- Name: questions questions_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id);


--
-- Name: quiz_attempts quiz_attempts_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.daily_challenges(id) ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- Name: quiz_attempts quiz_attempts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.quiz_attempts
    ADD CONSTRAINT quiz_attempts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: session session_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: video_watches video_watches_topic_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.video_watches
    ADD CONSTRAINT video_watches_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id) ON DELETE CASCADE;


--
-- Name: video_watches video_watches_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.video_watches
    ADD CONSTRAINT video_watches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--



-- Data
COPY "user_progress" FROM stdin;
DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	0	0	5	1	2026-07-17 08:44:24.601811+00	2026-07-17
DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	0	0	5	1	2026-07-20 05:38:25.549893+00	2026-07-20

\.

COPY "topics" FROM stdin;
5	What is the Mesentery	The mesentery is a fold of tissue that anchors the intestines to the abdominal wall while carrying blood vessels, nerves, and lymphatic vessels that keep the gut functioning.\n\nFar more than a simple support structure, it plays a crucial role in digestion, immunity, and communication between organs.	https://www.instagram.com/reel/DaYAesay6KL/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==	Biology	{#sciencefacts,"#medicalscience ","#humanbody ","#anatomy ","#mesentery "}	30	5	t	horizontal		f	2026-07-27 08:22:05.801379+00
6	What are the tonsils?	The tonsils are clusters of lymphoid tissue located at the back of the throat that serve as one of the body's first lines of immune defense against germs entering through the mouth and nose.\nThey help detect bacteria and viruses, activate immune cells, and produce antibodies to fight infection, especially during childhood.	https://www.instagram.com/reel/DaSHPdhspGa/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==	Biology	{"#Tonsils  ","#ImmuneSystem "," #HumanAnatomy",#LymphaticSystem,#BodyScience}	30	5	t	horizontal		f	2026-07-27 08:22:05.801379+00
8	What is the shinbone (tibia)?		https://www.youtube.com/shorts/s3NiSqSJsPw	Biology	{}	30	5	t	vertical	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXQLN93wocG5V3f6kK0ye4TozuPlwKJ4A9EgMP4NryWMbQOZ6PkD6VjqE&s	f	2026-07-27 08:22:05.801379+00
7	How does the human spine support your entire body?	The spine is a flexible column of 33 vertebrae that supports the body's weight, protects the spinal cord, and allows movements such as bending, twisting, and standing upright.\nIntervertebral discs act as shock absorbers, while muscles and ligaments stabilize the spine and help maintain posture and balance.	https://www.instagram.com/reel/DaPhamnMMZ-/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==	Biology	{#Spine," #HumanAnatomy ",#BodyScience," #BackHealth ",#VertebralColumn}	30	5	t	horizontal		t	2026-07-27 08:22:05.801379+00
4	What is the urinary bladder?	The urinary bladder is a hollow, muscular organ that stores urine produced by the kidneys until it is ready to be expelled through the urethra. As it fills, stretch receptors signal the brain, creating the urge to urinate and helping maintain the body's fluid and waste balance.	https://youtube.com/shorts/1Cg3Cwu_sbw?feature=share	Biology	{gladder,"human anatomy","urinary system","human biology"}	45	10	t	horizontal		t	2026-07-27 08:22:05.801379+00

\.

COPY "infographics" FROM stdin;
4	Immune System	What is the immune system?\n\nThe immune system is the body's natural defense network, \nmade up of white blood cells, antibodies, lymph nodes, the spleen, bone marrow, \nand other organs that work together to identify and eliminate harmful bacteria, viruses, \nfungi, parasites, and abnormal cells. It also creates immune memory, allowing the body to respond faster to future infections.\n\n\nThis content is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXQLN93wocG5V3f6kK0ye4TozuPlwKJ4A9EgMP4NryWMbQOZ6PkD6VjqE&s		t

\.

COPY "worksheets" FROM stdin;
3	Liver anatomy	Fill-in-the-blank worksheet	https://pdfobject.com/pdf/sample.pdf	t
2	Heart anatomy	Label the diagram worksheet	https://pdfobject.com/pdf/sample.pdf	t
1	Photosynthesis	Practice sheet with 10 problems	https://pdfobject.com/pdf/sample.pdf	f

\.

COPY "user" FROM stdin;
DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	sunil	sunil@gmail.com	f	\N	2026-07-08 07:21:04.003	2026-07-08 07:21:04.003	f				{}	t	f	\N	0.00
MJJqtlQRh4WhVboAlFMTlQl2CPgxiGEz	sam	sam@gmail.com	f	\N	2026-07-17 11:00:31.85	2026-07-17 11:00:31.85	f				{}	t	f	\N	0.00
hwlpgFuM8GTjvkaohWE7GE07F71ZAyaX	tt	tt@gmail.com	f	\N	2026-07-19 05:46:57.065	2026-07-19 05:46:57.065	f				{}	t	f	\N	0.00
DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	Sam james	james@gmail.com	f	\N	2026-07-08 07:31:55.266	2026-07-26 05:50:29.070581	t				{}	t	f	\N	0.00
0SfaTNSZb2pcx7xA3A33T5wrGneTizJV	Scoolam User	dev@scoolam.com	f	\N	2026-07-26 05:51:38.897	2026-07-26 05:51:38.897	f				{}	t	f	\N	0.00
tk2sRhAjJ4JzLfxvxWuHdEaIgqh2YhRm	insidergoa	insidergoa@gmail.com	f	\N	2026-07-26 06:00:33.54	2026-07-26 06:00:33.54	f				{}	t	f	\N	0.00

\.

COPY "session" FROM stdin;
K6la7EJOk3I0ohYQ28EDVZjuTegsQntz	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	SdCrnEAImOvC74mlrmlinlA1HKQd4nPM	2026-07-15 07:21:04.17	10.12.30.112	Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148	2026-07-08 07:21:04.171	2026-07-08 07:21:04.171
nbY8t6FWo3fVIxKYeeVUQ8ysUnD8l8uq	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	4DU1wo2olsDCrtVgdPoLSdujbJFLuLMM	2026-07-15 07:21:44.046	10.12.30.112	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-08 07:21:44.046	2026-07-08 07:21:44.046
FBvbaRsDqNxFYxJ7Be69ZRyoqvyeHf5W	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	pm1eO9MRqMfzEJelFiBdlQhntYgULDBG	2026-07-15 07:31:55.425	10.12.30.112	Mozilla/5.0 (Linux; Android 16; SM-S721B Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.159 Mobile Safari/537.36	2026-07-08 07:31:55.425	2026-07-08 07:31:55.425
s3qFgfpgUNnbtSJY0FfPdm2Pu47SR0tr	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	k6SEAFhSUByKnUT9fQOIlfWKL2bqaLp4	2026-07-15 07:32:38.447	10.12.30.112	Mozilla/5.0 (Linux; Android 16; SM-S721B Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.159 Mobile Safari/537.36	2026-07-08 07:32:38.447	2026-07-08 07:32:38.447
3UxG07BpkvULvCz46AJHs1Fu3vw3Jds3	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	jQQr75SGbVJfDvmNs9UiVUxGXmQZCqpO	2026-07-15 08:08:53.684	10.12.30.112	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-08 08:08:53.684	2026-07-08 08:08:53.684
9X7bff4MWHm3NuzgNMNViujIzAOcxowo	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	semzdcz5lYZUJTUH0XiSCLS37J3ZZnIl	2026-07-15 09:33:33.603	10.12.30.112	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-08 09:33:33.603	2026-07-08 09:33:33.603
tWq92Yyw0SrgMCLzjnTbtH444bMGhSMT	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	TCvY0BmajZBeJk8NEHHDKaSeGbeU5kSY	2026-07-15 09:34:49.511	10.12.30.112	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36	2026-07-08 09:34:49.511	2026-07-08 09:34:49.511
lhm6y7Lqcv0VRwqtQ4d0Y3O88XaYiCZG	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	WAsKNPj5gKdr5MJGoy6kyI5HUOsTjDtQ	2026-07-15 09:36:33.726	10.12.30.112	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-08 09:36:33.727	2026-07-08 09:36:33.727
h3ArUoIQml0ugb8UseMTMrDvvqoI9r82	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	BVGyT9I6FznZrKIyzwTC9KZYBnFpN28G	2026-07-15 16:02:31.541	10.12.216.220	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-08 16:02:31.542	2026-07-08 16:02:31.542
zUcbpubib1YKFbmAYW4WSO0YBHQMT6BH	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	LBBvsWaEy4QuLeWhxorDntpKhObXspe2	2026-07-16 10:53:23.333	10.12.79.132	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 10:53:23.333	2026-07-09 10:53:23.333
n2nOD5O4OrGwBnnuzOfQooqxcuJYmc3F	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	yRThanWLXivYlVp71YN61OO7Jc5FjY6j	2026-07-16 11:09:17.374	10.12.79.132	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-09 11:09:17.374	2026-07-09 11:09:17.374
RaUvyVyXIWaSayDlAHRiB8TaUvQSxRaL	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	1THWmoQF4rKF9zMtOy1Spea4fNwl6hHg	2026-07-17 05:47:48.56	10.12.44.58	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-10 05:47:48.561	2026-07-10 05:47:48.561
mNU94Nrg63jMI8Myt89C9WuW0CCKGEME	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	PHzvtOmE6lrdVyFTRkHPAmzHQdCB5Jt8	2026-07-17 05:51:31.633	10.12.44.58	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-10 05:51:31.634	2026-07-10 05:51:31.634
l6TxneNcv3k1sVo03sEHrdm7JzFNYZgB	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	oZ2lDzSGlGYNcutyO479du2UVYOOGwF1	2026-07-17 05:54:10.667	10.12.44.58	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-10 05:54:10.667	2026-07-10 05:54:10.667
y4To7WetNaq5ECOlsRg233BW8YSBy2QF	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	RJpYCQOiYyKreyDJiJqeF4Sw61zoXBA8	2026-07-17 05:57:41.34	10.12.44.58	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-10 05:57:41.341	2026-07-10 05:57:41.341
AmodCdaV4jIUb6rogNLbQSpwahzb1emU	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	vUiuzdwewsIYtFtgD3vDnLV2eTbCtlGZ	2026-07-17 06:16:47.292	10.12.44.58	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-10 06:16:47.294	2026-07-10 06:16:47.294
xz2jpQDvZiYmX4nFtBBiO8yZxpkmv9Zw	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	Kl0Je95Vi1zijtMV2mhWVhpA7LpM28Po	2026-07-17 07:25:17.139	10.12.44.58	Mozilla/5.0 (Linux; Android 16; SM-S721B Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.159 Mobile Safari/537.36	2026-07-10 07:25:17.14	2026-07-10 07:25:17.14
X5VPE8aK1LqclW4Of9lIKevHVmZMSWzw	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	JNdeUOj1Hv2cnH6D35SBDPuZZZqUGUJU	2026-07-18 09:01:49.902	10.12.44.58	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36	2026-07-10 06:53:44.879	2026-07-11 09:01:49.902
zP8rJv1oFLaOBZPzv7QrfMfNGFDy55II	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	oocjylW3pSQ0a4R8WPIEPxf6HCiHGqWd	2026-07-18 15:56:00.207	10.12.231.80	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-11 15:56:00.208	2026-07-11 15:56:00.208
11n49TA67g4GFPF2XaDcBJHsqHvspoV6	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	oWsPjiYKyzGoQRADVoVh5ucQoXey4bTZ	2026-07-18 15:56:20.948	10.12.231.80	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-11 15:56:20.948	2026-07-11 15:56:20.948
yyb7aExmT56cfukkJWOgtuOVQHIS9VEu	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	4R0DzOhYpCcHYilJWTKV6MREJOP2ZdIQ	2026-07-18 15:59:33.533	10.12.231.80	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-11 15:59:33.534	2026-07-11 15:59:33.534
SO0O0dEmMsdY9qCb8Jh9lsiil3vPhNHU	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	uSw5OHhSgZyVdOFplVbVClvznTvTxJ0K	2026-07-20 05:25:25.849	10.12.184.180	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-13 05:25:25.849	2026-07-13 05:25:25.849
ivr4cGtMJqgP0PeMG9iDRAiSBE4JA7CX	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	YoP4SwIShlLlQwDB6VJOvX2TFG1xtZ4j	2026-07-21 07:32:19.399	10.12.184.180	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-13 05:01:34.393	2026-07-14 07:32:19.399
3ITkfjKXx39veSEWDxZvFndbBtRTG0lG	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	h8TpG8aquUaZhJa3EVQu9Zi2ScGR9cOV	2026-07-21 07:58:33.735	10.12.174.118	Mozilla/5.0 (Linux; Android 16; SM-S721B Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.159 Mobile Safari/537.36	2026-07-14 07:58:33.736	2026-07-14 07:58:33.736
TcTfymITHdYG14mzl6q6LLOWOGnQs0mJ	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	4Zxpm3lRVBsjSEoZSX6ZksFYD6HuFEm5	2026-07-23 08:40:33.927	10.12.13.6	Mozilla/5.0 (Linux; Android 16; SM-S721B Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.159 Mobile Safari/537.36	2026-07-16 08:40:33.927	2026-07-16 08:40:33.927
tnRNIr42mJqVzkDI9W8QkPb1GOQt7AOX	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	N8AxT7O47ulwSXYbHIRifaZJt7TX6t4o	2026-07-23 08:44:04.511	10.12.13.6	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/30.0 Chrome/143.0.0.0 Mobile Safari/537.36	2026-07-16 08:44:04.511	2026-07-16 08:44:04.511
r8Kn4mI6PvoGvgY9drqo0VO0sJ3yw7cO	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	wPa3MIaS6s8k3xvDrd2gPnwpTbvaWCN1	2026-07-23 09:51:20.043	10.12.13.6	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-16 09:51:20.043	2026-07-16 09:51:20.043
4TvMyl0zevpbRRlAKxhFg1I59TQzwORS	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	HsmDg9yx4epMEcTsur7oVysEJPYXW5a4	2026-07-24 07:43:50.653	10.12.13.6	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-17 07:43:50.653	2026-07-17 07:43:50.653
ppkdWuoAmcBKNcrS5Rguwi4G32M2g8KQ	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	ahVoFccBOhUqDzetfHakrPus4TwdHk11	2026-07-24 07:58:38.669	10.12.107.78	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-17 07:58:38.67	2026-07-17 07:58:38.67
kR1rSl8MQtNlbYwTs8iKPMrOnj7cDzIK	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	kTWsgW9D0TAg0J0HGQXXhZqvVVaWi3qJ	2026-07-24 08:41:57.597	10.12.107.78	Mozilla/5.0 (Linux; Android 16; SM-S721B Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/149.0.7827.159 Mobile Safari/537.36	2026-07-17 08:41:57.598	2026-07-17 08:41:57.598
vU4XFgAnpjCrSg4GDAm0aZcB8w1aPN8m	MJJqtlQRh4WhVboAlFMTlQl2CPgxiGEz	Xp4wmGPgMPa6NHrGT85Pnr4D1TuAJZ5H	2026-07-24 11:00:32.019	10.12.107.78	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-17 11:00:32.02	2026-07-17 11:00:32.02
BAt7ukU9YSKryLBcpuxd9hpnSt6UxX8Y	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	F0MTJgXoLpdJfrQTN1TvnJRMLjbnYifY	2026-07-25 08:50:26.926	10.12.36.244	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-18 08:50:26.926	2026-07-18 08:50:26.926
wNfJBpToIbWGq2108PWjvnELoXRwc3Dd	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	TU0qup0aHqpUUmYWvqASBBY4jL1WYaZT	2026-07-25 09:05:19.305	10.12.36.244	Mozilla/5.0 (Linux; Android 16; SM-S721B Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/150.0.7871.46 Mobile Safari/537.36	2026-07-18 09:05:19.305	2026-07-18 09:05:19.305
xMcH5NxM70jNmkrI04m2vIOMnbTW3bDe	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	oyJyYmN1HhJrPNC4p3FkY5Nu7S6PhNCC	2026-07-26 05:29:55.747	10.12.215.68	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-19 05:29:55.748	2026-07-19 05:29:55.748
HxH0ZfWSPyWAWYV1dnXJQfdbxtYtSjpN	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	Is8iWtgbv3rxIgAUvDDDRPfZ8m2CbESj	2026-07-26 05:33:43.774	10.12.215.68	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-19 05:33:43.775	2026-07-19 05:33:43.775
JDGgHOhMXrpzysmQrwlkLhplvnIq5JlB	hwlpgFuM8GTjvkaohWE7GE07F71ZAyaX	SaCnoC1ZZlCCBtZoIGoNjsn1OkCUfTtW	2026-07-26 05:46:57.223	10.12.215.68	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-19 05:46:57.224	2026-07-19 05:46:57.224
ZuMtMLPeyPZwVEZr7GxY1q0PE7sQ2nzS	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	sWgvXrwtmsIp0oLK2rSGGDMSKPDreMwz	2026-07-26 06:39:40.601	10.12.215.68	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-19 06:39:40.601	2026-07-19 06:39:40.601
sGDUMEiEiajUQVTASDYPX6csgjzQJ4Vn	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	DIj3jmcS78QO8lNTxPOwxcqEvrsqV1tN	2026-08-02 05:53:57.457	10.12.53.114	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-26 05:53:57.457	2026-07-26 05:53:57.457
2tBSIxHq1mQflPTP8s7zCkbASe0v7yev	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	bDtACKyI6zwUmUN2VF3JrPnfnhAwL6IS	2026-08-02 05:56:40.168	10.12.53.114	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-26 05:56:40.169	2026-07-26 05:56:40.169
iHyeLEGU3ppHdV5CPwo8LYVXCqDTIVEJ	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	zCfqHb0QIE6ABWSunBBqMUIUgr7EYvNp	2026-07-28 14:59:27.697	10.12.195.4	Mozilla/5.0 (Linux; Android 16; SM-S721B Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/150.0.7871.46 Mobile Safari/537.36	2026-07-21 14:59:27.709	2026-07-21 14:59:27.709
gcMf8W2un6uVLNkSAp0HWHYTdwROYzME	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	tKyyPXO6eKNOePbQzdFlxOXKoq4Wt36z	2026-07-28 18:15:51.958	10.12.195.4	Mozilla/5.0 (iPad; CPU OS 26_5_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/150.0.7871.51 Mobile/15E148 Safari/604.1	2026-07-21 18:15:51.958	2026-07-21 18:15:51.958
8SRxWdINdikUuVY0kyMe8PM5f2Hmlvy2	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	UMESWLVY82RO0C1b6yoVC49TvNHHc4F7	2026-07-28 18:19:24.041	10.12.195.4	Mozilla/5.0 (iPad; CPU OS 26_5_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/150.0.7871.51 Mobile/15E148 Safari/604.1	2026-07-21 18:19:24.041	2026-07-21 18:19:24.041
R6ZW0EV9g23rk5mLrQFODYip4fgTZCZr	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	DwvRkCrDXTY1m93yNauFoC8YUJgMfc3L	2026-07-28 18:55:50.812	10.12.195.4	Mozilla/5.0 (iPad; CPU OS 26_5_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/150.0.7871.51 Mobile/15E148 Safari/604.1	2026-07-21 18:55:50.812	2026-07-21 18:55:50.812
j9Yw8zkhUxKM00sQzd7L4JOxtRyUgrAb	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	beOxSFjX0d7G2snW75AUh8zdwznugQF9	2026-07-29 19:46:58.822	10.12.3.226	Mozilla/5.0 (iPad; CPU OS 26_5_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/150.0.7871.113 Mobile/15E148 Safari/604.1	2026-07-22 19:46:58.824	2026-07-22 19:46:58.824
7j67EkRZKzcUhG3bOSwQ1da7eDKOQ3jA	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	CMuztO5Ciy6vjTTmHcz1UCUBD8Hr9wOk	2026-07-29 19:51:55.197	10.12.3.226	Mozilla/5.0 (iPad; CPU OS 26_5_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/150.0.7871.113 Mobile/15E148 Safari/604.1	2026-07-22 19:51:55.198	2026-07-22 19:51:55.198
3OJWfNY1j0RD4SSLtkoLvbTvrQuODVBM	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	Lk4RDdWbi5LIJ7Fb0f8sRzz95Hbt6y1I	2026-07-29 19:52:08.694	10.12.3.226	Mozilla/5.0 (iPad; CPU OS 26_5_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/150.0.7871.113 Mobile/15E148 Safari/604.1	2026-07-22 19:52:08.694	2026-07-22 19:52:08.694
woKfxycqY0Zxe91HQDARYDRtAZ6vxOIj	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	pWLploE83VKvaLcJzchsKcfxaPCPcufw	2026-07-29 19:52:50.641	10.12.3.226	Mozilla/5.0 (iPad; CPU OS 26_5_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/150.0.7871.113 Mobile/15E148 Safari/604.1	2026-07-22 19:52:50.641	2026-07-22 19:52:50.641
YteMLlZr0OtP8oQpMlIhhxVd3PaEhNMe	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	tM1h4UHUdzNUElblfjgPEugLhrvbBSea	2026-07-31 11:32:00.317	10.12.254.218	Mozilla/5.0 (Linux; Android 16; SM-S721B Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/150.0.7871.46 Mobile Safari/537.36	2026-07-24 11:32:00.319	2026-07-24 11:32:00.319
tK6aE1HUUmt8H5Zwjx8YA9eEJjeoiOaH	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	fuezdxW4q1tbjmE6TBDEvzF5FEeluTYk	2026-08-01 09:22:35.591	10.12.254.36	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-25 09:22:35.592	2026-07-25 09:22:35.592
h1XxJVCZmiQw7G7PQiYZeGJJy11TXPXS	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	zfTsw5FMkgOfwn0lQ0CS3ilIF0bWgn9d	2026-08-01 12:53:15.35	10.12.215.68	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-19 05:47:19.403	2026-07-25 12:53:15.35
r53LPWBrAouY8OWKBbjthzqo4ASuAAbi	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	6ZR80dXQQ0s120DviSNiFa6TebDRou7l	2026-08-02 05:48:29.084	10.12.53.114	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-26 05:48:29.084	2026-07-26 05:48:29.084
1wK5OINuWKfQlpLfL9J1XeWv6FEQwVZx	0SfaTNSZb2pcx7xA3A33T5wrGneTizJV	AzgAbVbmLyDVhHxVlNnvOi6rY3JqJlZv	2026-08-02 05:51:39.024	10.12.53.114	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-26 05:51:39.024	2026-07-26 05:51:39.024
7qFrTRReq6SdYHFygf21b2ER9POpsXcH	tk2sRhAjJ4JzLfxvxWuHdEaIgqh2YhRm	cybiMZWVo0qi9xnLdkabcvDMeu42XAXc	2026-08-02 06:00:33.664	10.12.53.114	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-26 06:00:33.664	2026-07-26 06:00:33.664
026eUIVt6S9edJAxg6SGMbLhRBigBtRu	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	fd6QSa6a6s06Qki617uuunhOIAaGO0y5	2026-08-02 18:53:02.808	10.12.53.114	Mozilla/5.0 (Linux; Android 16; SM-S721B Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/150.0.7871.124 Mobile Safari/537.36	2026-07-26 18:53:02.809	2026-07-26 18:53:02.809
yisR0sIlDBMI4VXfFWGsUXDy6NDT3v6G	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	3yUMSJ6b6qyHkOEghrIkWNODmM3ynxHD	2026-08-03 08:32:34.422	10.12.201.162	Mozilla/5.0 (Linux; Android 16; SM-S721B Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/150.0.7871.124 Mobile Safari/537.36	2026-07-27 08:32:34.423	2026-07-27 08:32:34.423
uyY8nqjDNvtOLD8Isx8q1SfIkezalwVu	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	I04zSZmSxAmgb0dVuHQPL1RhStSloJYJ	2026-08-03 08:46:52.471	10.12.201.162	Mozilla/5.0 (Linux; Android 16; SM-S921E Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/150.0.7871.124 Mobile Safari/537.36	2026-07-27 08:46:52.472	2026-07-27 08:46:52.472
FrH7uSHgwNhIJdPusKZ01DX90cqfrQ8Z	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	CT6VLepLPw6ELK9IbcccGABL3XdtEAKK	2026-08-04 10:21:31.328	10.12.53.114	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-26 06:13:34.331	2026-07-28 10:21:31.328
EUUoCjh1GWvmjSRJJNM0nhcuxzTBqICh	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	WyxN5tlMvrUsyQHLQUg6YLT6wg5eSWMk	2026-08-04 10:41:42.365	10.12.7.80	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-28 10:41:42.366	2026-07-28 10:41:42.366
dUz6DKzp7e8KeIgsMEx6tuo5ESlyIHdz	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	WIdYVr1io8hBt0Uj77mshGLUfgYR5GCm	2026-08-04 10:43:09.058	10.12.7.80	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36	2026-07-28 10:43:09.058	2026-07-28 10:43:09.058

\.

COPY "questions" FROM stdin;
3	4	1. What is the primary function of the urinary bladder?	["A. Filter blood", "B. Produce urine", "C. Store urine until it is expelled", "D. Absorb water from urine"]	2	Correct Answer: C. Store urine until it is expelled\n\nExplanation:\nThe urinary bladder acts as a temporary reservoir for urine produced by the kidneys. It safely stores urine until urination occurs.	t
4	4	2. Where is the urinary bladder located?	["A. Behind the heart", "B. Deep within the pelvis", "C. Inside the abdominal cavity near the liver", "D. Beneath the lungs"]	1	Correct Answer: B. Deep within the pelvis\n\nExplanation:\nThe bladder lies within the pelvic cavity, protected by the pelvic bones. Its position allows it to expand as it fills.	t
5	4	3. Urine enters the bladder from the kidneys through which structures?	["A. Urethra", "B. Renal arteries", "C. Ureters", "D. Nephrons"]	2	Correct Answer: C. Ureters\n\nExplanation:\nTwo ureters transport urine from the kidneys to the bladder. Each kidney connects to the bladder through one ureter.	t
6	4	4. How many ureters normally enter the urinary bladder?	["A. One", "B. Two", "C. Three", "D. Four"]	1	Correct Answer: B. Two\n\nExplanation:\nThere are two ureters—one from each kidney. They continuously deliver urine into the bladder.	t
7	4	5. Which organ produces urine before it reaches the bladder?	["A. Liver", "B. Kidneys", "C. Pancreas", "D. Spleen"]	1	Correct Answer: B. Kidneys\n\nExplanation:\nThe kidneys filter blood and produce urine. The bladder only stores urine and does not produce it.	t
8	4	6. The wall of the bladder is primarily made of ________.\n	["A. Bone tissue", "B. Smooth muscle", "C. Cardiac muscle", "D. Skeletal muscle"]	1	Correct Answer: B. Smooth muscle\n\nExplanation:\nThe bladder wall is composed mainly of smooth muscle. This muscle allows the bladder to stretch and contract automatically.	t
9	4	7. Why can the bladder store large amounts of urine?\n	["A. It contains cartilage.", "B. Its muscular wall gradually stretches. ", "C. It continuously empties itself.", "D. It absorbs urine into the bloodstream."]	1	Correct Answer: B. Its muscular wall gradually stretches.\n\nExplanation:\nThe bladder has an elastic muscular wall that expands as urine accumulates. This prevents pressure from rising too quickly.	t
10	4	8. As the bladder fills, which specialized structures become activated?\n	["A. Pain receptors", "B. Taste receptors", "C. Stretch receptors ", "D. Heat receptors"]	2	Correct Answer: C. Stretch receptors\n\nExplanation:\nStretch receptors detect bladder expansion. They help determine when the bladder is becoming full.	t
11	4	9. Stretch receptors send signals directly to the ________.	["A. Heart", "B. Brain", "C. Liver", "D. Pancreas"]	1	Correct Answer: B. Brain\n\nExplanation:\nSignals from stretch receptors travel through nerves to the brain. The brain decides whether it is an appropriate time to urinate.	t
12	4	10. Which muscle forms the main muscular wall of the bladder?	["A. Diaphragm", "B. Detrusor muscle ", "C. Deltoid muscle", "D. Masseter muscle"]	1	Correct Answer: B. Detrusor muscle\n\nExplanation:\nThe detrusor muscle surrounds the bladder. It contracts during urination to expel urine.	t
13	5	1. What is the primary function of the mesentery?	["A. Produce digestive enzymes", "B. Store bile", "C. Suspend and support the intestines while carrying blood vessels, nerves, and lymphatics", "D. Filter blood"]	2	Correct Answer: C. Suspend and support the intestines while carrying blood vessels, nerves, and lymphatics\n\nExplanation:\nThe mesentery anchors the intestines to the posterior abdominal wall. It also serves as a pathway for blood vessels, nerves, and lymphatic vessels supplying the intestines.	t
14	5	2. The mesentery is primarily composed of which type of tissue?	["A. Muscle tissue", "B. Bone tissue", "C. Double layer of peritoneum", "D. Cartilage"]	2	Correct Answer: C. Double layer of peritoneum\n\nExplanation:\nThe mesentery consists of two layers of peritoneum folded together. This structure provides support while allowing the intestines to remain mobile.	t
15	5	3. Which part of the digestive tract is mainly suspended by the mesentery?	["A. Esophagus", "B. Stomach", "C. Small intestine ", "D. Rectum"]	0	Correct Answer: C. Small intestine\n\nExplanation:\nThe mesentery primarily suspends the jejunum and ileum. It allows these intestinal loops to move freely without becoming tangled.	t
16	5	4. Which structures travel through the mesentery to reach the intestines?	["A. Hair follicles", "B. Blood vessels, nerves, and lymphatic vessels ", "C. Tendons and ligaments", "D. Bronchi"]	1	Correct Answer: B. Blood vessels, nerves, and lymphatic vessels\n\nExplanation:\nThe mesentery acts as a conduit for arteries, veins, nerves, and lymphatics. These structures are essential for intestinal nutrition and function.	t
17	5	5. The mesentery connects the intestines to the ________.	["A. Liver", "B. Stomach", "C. Posterior abdominal wall ", "D. Bladder"]	2	Correct Answer: C. Posterior abdominal wall\n\nExplanation:\nThe mesentery firmly anchors the intestines to the back wall of the abdomen. This prevents excessive movement while maintaining flexibility.	t
18	5	6. Which nutrient is mainly absorbed into lymphatic vessels within the mesentery?\n	["A. Glucose", "B. Amino acids", "C. Dietary fats ", "D. Minerals"]	2	Correct Answer: C. Dietary fats\n\nExplanation:\nLymphatic vessels called lacteals absorb digested fats from the small intestine. These fats travel through the mesentery before entering the bloodstream.	t
19	6	1. Which statement best explains why the tonsils are considered the body's "first line of immune defense"?	["A. They are strategically located at the entrance of the respiratory and digestive tracts, where they monitor invading pathogens. ", "B. They produce digestive enzymes that destroy bacteria.", "C. They manufacture red blood cells to fight infections.", "D. They filter waste products from the bloodstream."]	0	Correct Answer: A\n\nExplanation:\nThe tonsils are positioned where inhaled and swallowed pathogens first enter the body. This location allows them to detect microbes early and initiate an immune response.	t
20	6	2. Which of the following is MOST likely to happen if bacteria become trapped within the crypts of the palatine tonsils?	["A. Increased urine production", "B. Formation of tonsil stones (tonsilloliths) and possible inflammation. ", "C. Decreased blood glucose levels", "D. Enlargement of the kidneys"]	1	Correct Answer: B\n\nExplanation:\nFood debris, dead cells, and bacteria can accumulate in tonsillar crypts. Over time, this material may harden into tonsil stones and contribute to recurrent inflammation.	t
21	6	3. During an infection, why do the tonsils become swollen?	["A. The tonsils fill with digestive enzymes.", "B. Blood flow decreases, causing fluid accumulation.", "C. Immune cells rapidly multiply and inflammatory fluid accumulates within the tissue. ", "D. The tonsils begin storing excess lymph."]	2	Correct Answer: C\n\nExplanation:\nInfection activates immune cells within the tonsils, increasing blood flow and inflammation. This causes the characteristic swelling and sore throat.	t
22	6	4. Which type of immune response is initiated when the tonsils recognize harmful microorganisms?	["A. Production of bile acids", "B. Secretion of digestive enzymes", "C. Breakdown of red blood cells", "D. Activation of lymphocytes and antibody production. "]	3	Correct Answer: D\n\nExplanation:\nThe tonsils contain B and T lymphocytes that recognize pathogens. Activated B cells produce antibodies, while T cells help destroy infected cells.	t
23	6	5. Which statement BEST describes the importance of healthy tonsils?	["A. They produce hormones that regulate metabolism.", "B. They store oxygen for the lungs.", "C. They act as muscles that control swallowing.", "D. They help identify and eliminate pathogens before they spread deeper into the body"]	3	Correct Answer: D\n\nExplanation:\nHealthy tonsils continuously monitor germs entering through the mouth and nose. By triggering early immune responses, they help reduce the spread of infection to the lower respiratory and digestive tracts.	t
25	7	2. Why are the natural curves of the human spine important?	["A. They increase the length of the spinal cord.", "B. They help distribute body weight, maintain balance, and absorb mechanical stress. ", "C. They prevent blood from reaching the brain.", "D. They reduce the number of vertebrae required for support."]	1	Correct Answer: B\n\nExplanation:\nThe cervical, thoracic, lumbar, and sacral curves act like a spring. They improve balance and reduce the impact of walking, running, and lifting.	t
26	7	3. Which part of the spine bears the greatest amount of body weight during standing and lifting?	["A. Cervical spine", "B. Thoracic spine", "C. Sacrum", "D. Lumbar spine "]	3	Correct Answer: D\n\nExplanation:\nThe lumbar vertebrae are the largest and strongest in the vertebral column. They support most of the upper body's weight and withstand significant mechanical forces.	t
27	7	4. Besides supporting the body, what is another essential function of the vertebral column?\n	[" A. Producing digestive enzymes", " B. Filtering blood before it reaches the heart", "C. Storing glucose for energy", "D. Protecting the spinal cord from injury. "]	3	Correct Answer: D\n\nExplanation:\nThe vertebrae form a protective canal around the spinal cord. This bony enclosure shields the delicate nervous tissue while allowing spinal nerves to exit safely.	t
28	7	5. Which statement BEST explains why the spine is both strong and flexible?\n	["A. It is made of a single solid bone.", "B. It contains only cartilage.", "C. It consists of multiple vertebrae connected by joints, ligaments, muscles, and shock-absorbing discs.", "D. It remains completely rigid throughout life."]	2	Correct Answer: C\n\nExplanation:\nThe spine is built from 33 interconnected vertebrae supported by discs, ligaments, and muscles. This design provides stability while allowing bending, twisting, and maintaining posture.	t
24	7	1. Which structure primarily allows the spine to support the body's weight while still permitting movement?	["A. The vertebrae stacked together with intervertebral discs between them. ", "B. The ribs attached to the thoracic vertebrae.", "C. The spinal nerves exiting the vertebral column.", "D. The spinal cord enclosed within the vertebral canal."]	0	Correct Answer: A\n\nExplanation:\nThe vertebrae provide strength, while the intervertebral discs absorb shock and allow flexibility. Together, they enable the spine to support body weight without sacrificing mobility.	t

\.

COPY "account" FROM stdin;
zGf4TWz5yNCChEjfuqBjqKIpJXzIE5Ns	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	credential	\N	\N	\N	\N	\N	\N	9a2cf2cbac15f9526891804517216624:eee2d8998e6a24f1e779c533568f2f65b7cf4f3e3ce5e0d9dd2d80c65d22e6e10ff01402a9213768a606b516932d51f4c9b7d9752b4e70efac214835e295e820	2026-07-08 07:21:04.083	2026-07-08 07:21:04.083
wKsKZHUIHPhHNe7Qx3XxS0fqe9WSq9ww	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	credential	\N	\N	\N	\N	\N	\N	2f7b21fdc91cdbb306373551a6015d77:8f6f5f61403d2f95cec4d254c0061a858d851cbb1ea86ab08867a647c597a2033bab1f1bad4b2ce715740620428bf4784d25e114ca32bcad3d3709f5fac3e16b	2026-07-08 07:31:55.342	2026-07-08 07:31:55.342
YOJlBXHyAK5CR049PxBTuUc4vGVHZOHp	MJJqtlQRh4WhVboAlFMTlQl2CPgxiGEz	MJJqtlQRh4WhVboAlFMTlQl2CPgxiGEz	credential	\N	\N	\N	\N	\N	\N	eeae3572924ac15d8b0440efa52673ea:fb2916450c24a34a49e47846af888aed78eb4b2d81d942b136df4806643e471fc20851b3643332d03583f6f015d1961a4ef3add11bd0931ba2cc5f2b94af4a01	2026-07-17 11:00:31.935	2026-07-17 11:00:31.935
6dOxJ3vMHsQSogzLNsVEZQv3lRzOjj2Q	hwlpgFuM8GTjvkaohWE7GE07F71ZAyaX	hwlpgFuM8GTjvkaohWE7GE07F71ZAyaX	credential	\N	\N	\N	\N	\N	\N	63c2c2ba626edcd31bfbeee36c84b6e2:54c1438deef004d64d5bac9e8264a03061ce7e2e1ed0e51cbb13bc13f56219b6b06c74d466d1a923a402d1c4e8339c64db4eef25c5a521d057684bd240ed1542	2026-07-19 05:46:57.142	2026-07-19 05:46:57.142
VzFUyjTE8hwIu9UjwxQt5JjlpJP41lEj	0SfaTNSZb2pcx7xA3A33T5wrGneTizJV	0SfaTNSZb2pcx7xA3A33T5wrGneTizJV	credential	\N	\N	\N	\N	\N	\N	de4b08ce7a7e92381861b36957ce9d52:1e9d9023fcb20461ab0d3b7ca237e066d6d5e97548b68a47e2bc46627506c32b0f74b16ae157cc0bf6ce539c7d1d55b28126ad1e5f418467d7db13e8bdff9928	2026-07-26 05:51:38.961	2026-07-26 05:51:38.961
G4IALiyPkSL60mPhhcsjWGM2y5Svhm1y	tk2sRhAjJ4JzLfxvxWuHdEaIgqh2YhRm	tk2sRhAjJ4JzLfxvxWuHdEaIgqh2YhRm	credential	\N	\N	\N	\N	\N	\N	5d85b0fe9c066d75e0f8158120ef8222:4280d38feda006e9b61cfae0cc0632c220756c6593effbcb1626d4c9af924530bb9bfe9ec22cc945665fd8f2c453c2cfd35ac579cfe0e26cc57f3dbc2c269767	2026-07-26 06:00:33.602	2026-07-26 06:00:33.602

\.

COPY "verification" FROM stdin;
otp_1785045683467_uugcfgqohp	insidergoa@gmail.com	162449	2026-07-26 06:11:23.291	2026-07-26 06:01:23.615477	2026-07-26 06:01:23.615477

\.

COPY "subscription_plans" FROM stdin;
2	Ads-Free	2.99	month	["Everything in Free", "No advertisements", "5 videos per day", "Unlimited infographics", "Unlimited worksheets", "Priority support"]	f	2	2026-07-16 08:43:26.464072+00					
1	Free	0.00	forever	["2 videos per day", "3 infographics per day", "2 worksheets per day", "Daily challenge", "Basic MCQ quizzes", "Add Visible Account"]	f	1	2026-07-16 08:43:26.464072+00					
3	Premium	29.99	month	["Everything in Ads-Free", "Unlimited videos", "Offline downloads", "Exclusive premium content", "Certificate sharing", "All subjects unlocked"]	t	3	2026-07-16 08:43:26.464072+00					

\.

COPY "quiz_attempts" FROM stdin;
1	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	7	5	5	2026-07-11 16:01:56.101184+00	\N
2	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	\N	3	5	2026-07-12 07:30:12.597794+00	1
3	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	\N	13	16	2026-07-12 10:53:01.932563+00	1
4	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	\N	8	16	2026-07-17 07:48:28.989777+00	1
5	DNeu5NgkjDEes1jEIlM0oGOsjckgBfY2	\N	12	30	2026-07-17 08:44:24.345143+00	2
6	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	\N	8	30	2026-07-20 05:38:25.298842+00	2

\.

COPY "help_topics" FROM stdin;
1	How to Reset the password	Logout and reset	0	t	2026-07-26 06:30:43.858985+00	2026-07-26 06:30:43.858985+00

\.

COPY "issue_reports" FROM stdin;
1	0SfaTNSZb2pcx7xA3A33T5wrGneTizJV	Scoolam User	dev@scoolam.com	Test	not able to test	in_progress	t	2026-07-26 05:53:48.947511+00
2	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	sunil	sunil@gmail.com	hello sam	test this feature	resolved	t	2026-07-27 08:28:33.320255+00

\.

COPY "referral_codes" FROM stdin;
1	0SfaTNSZb2pcx7xA3A33T5wrGneTizJV	FWK4LYU4	2026-07-26 05:51:51.005421+00
2	DuEZ0FL3YWfY0SmPruP1Q5xUq3NqgJGc	QTHLHDK3	2026-07-26 06:29:14.059908+00

\.

COPY "daily_challenges" FROM stdin;
1	Biology MCQs for Graduation Level (Basic → Advanced)	These questions cover major graduation-level biology topics, including cell biology, genetics, molecular biology, physiology, biochemistry, microbiology, immunology, evolution, and ecology, with increasing difficulty from foundational to advanced concepts.	30	30	t	t	2026-07-12 06:52:54.100979+00
2	Biology Anatomy MCQs		30	30	t	t	2026-07-17 08:38:24.746662+00

\.

COPY "daily_challenge_questions" FROM stdin;
1	1	Which organelle is known as the powerhouse of the cell?	["A. Ribosome", "B. Nucleus", "C. Mitochondria", "D. Golgi apparatus"]	2	✅ Answer: C. Mitochondria\nDescription: Mitochondria produce ATP through cellular respiration, supplying energy for cellular activities.	t
2	1	Which biomolecule stores genetic information?	["A. Protein", "B. DNA", "C. Lipid", "D. Carbohydrate"]	1	✅ Answer: B. DNA\nDescription: DNA carries hereditary information and directs protein synthesis.	t
3	1	Which process is responsible for producing glucose in plants?	["A. Respiration", "B. Fermentation", "C. Photosynthesis", "D. Transpiration"]	2	✅ Answer: C. Photosynthesis\nDescription: Plants convert sunlight, carbon dioxide, and water into glucose and oxygen.	t
4	1	Which blood cells help in fighting infections?	["A. Red blood cells", "B. Platelets", "C. White blood cells", "D. Plasma cells"]	2	✅ Answer: C. White blood cells\nDescription: White blood cells (leukocytes) protect the body against pathogens.	t
5	1	The functional unit of the kidney is the:	["A. Neuron", "B. Nephron", "C. Alveolus", "D. Sarcomere"]	1	✅ Answer: B. Nephron\nDescription: Nephrons filter blood and form urine.	t
6	1	Which phase of mitosis is characterized by chromosome alignment at the equator?	["A. Prophase", "B. Metaphase", "C. Anaphase", "D. Telophase"]	1	✅ Answer: B. Metaphase\nDescription: Chromosomes align on the metaphase plate before separation.	t
7	1	Which enzyme unwinds DNA during replication?\n	["A. DNA Polymerase", "B. Ligase", "C. Helicase", "D. Primase"]	2	✅ Answer: C. Helicase\nDescription: Helicase separates the two DNA strands by breaking hydrogen bonds.	t
8	1	According to Mendel's Law of Segregation, alleles separate during:	["A. Fertilization", "B. DNA replication", "C. Gamete formation", "D. Mutation"]	2	✅ Answer: C. Gamete formation\nDescription: Each gamete receives only one allele of a gene.	t
9	1	Which hormone primarily lowers blood glucose levels?	["A. Glucagon", "B. Insulin", "C. Adrenaline", "D. Cortisol"]	1	✅ Answer: B. Insulin\nDescription: Insulin promotes glucose uptake into cells and glycogen formation.	t
10	1	The lac operon in E. coli is an example of:	["A. Positive gene regulation", "B. Negative gene regulation", "C. Epigenetic regulation", "D. RNA interference"]	1	✅ Answer: B. Negative gene regulation\nDescription: The lac repressor binds the operator and prevents transcription in the absence of lactose.	t
11	1	During meiosis, crossing over primarily occurs in which stage of Prophase I?	["A. Leptotene", "B. Zygotene", "C. Pachytene", "D. Diplotene"]	0	✅ Answer: C. Pachytene\nDescription: Homologous chromosomes exchange genetic material during the pachytene stage.	t
12	1	Which enzyme catalyzes the fixation of atmospheric carbon dioxide during photosynthesis?	["A. RuBisCO", "B. ATP synthase", "C. Cytochrome oxidase", "D. Carbonic anhydrase"]	0	✅ Answer: A. RuBisCO\nDescription: RuBisCO catalyzes the first step of the Calvin cycle by fixing CO₂.	t
13	1	Which immunoglobulin is the predominant antibody found in mucosal secretions such as saliva and tears?	["A. IgM", "B. IgG", "C. IgE", "D. IgA"]	3	✅ Answer: D. IgA\nDescription: Secretory IgA protects mucosal surfaces from pathogens.	t
14	1	Which of the following violates the assumptions of the Hardy–Weinberg equilibrium?	["A. Large population size", "B. Random mating", "C. Natural selection", "D. No mutation"]	2	✅ Answer: C. Natural selection\nDescription: Hardy–Weinberg equilibrium assumes no natural selection occurs.	t
15	1	Which DNA repair pathway primarily removes UV-induced thymine dimers?	["A. Nucleotide excision repair", "B. Base excision repair", "C. Mismatch repair", "D. Homologous recombination"]	0	✅ Answer: A. Nucleotide excision repair\nDescription: This pathway excises damaged DNA containing bulky lesions such as thymine dimers.	t
16	1	Which enzyme is considered the rate-limiting regulatory enzyme of glycolysis?	["A. Hexokinase", "B. Pyruvate kinase", "C. Enolase", "D. Phosphofructokinase-1 (PFK-1)"]	3	✅ Answer: D. Phosphofructokinase-1 (PFK-1)\nDescription: PFK-1 is the major regulatory enzyme controlling glycolytic flux.	t
17	2	Which organ pumps blood throughout the body?	["A. Lung", "B. Heart", "C. Kidney", "D. Liver"]	1	✅ Correct Answer: B. Heart\n\nExplanation: The heart is a muscular organ that pumps oxygenated and deoxygenated blood through the circulatory system.	t
18	2	How many chambers does the human heart have?	["A. 2", "B. 3", "C. 4", "D. 5"]	3	✅ Correct Answer: C. 4\n\nExplanation: The heart has two atria and two ventricles, making four chambers.	t
19	2	Which bone is the longest in the human body?	["A. Tibia", "B. Femur", "C. Humerus", "D. Radius"]	1	✅ Correct Answer: B. Femur\n\nExplanation: The femur (thigh bone) is the longest and strongest bone.	t
21	2	Which organ is mainly responsible for breathing?	["A. Liver", "B. Brain", "C. Lungs", "D. Kidney"]	2	✅ Correct Answer: C. Lungs\n\nExplanation: The lungs exchange oxygen and carbon dioxide.	t
22	2	What is the largest organ of the human body?	["A. Liver", "B. Brain", "C. Skin", "D. Lung"]	2	✅ Correct Answer: C. Skin\n\nExplanation: The skin protects the body and regulates temperature.	t
23	2	Which bone protects the brain?	["A. Rib", "B. Skull", "C. Pelvis", "D. Femur"]	1	✅ Correct Answer: B. Skull\n\nExplanation: The skull surrounds and protects the brain from injury.	t
24	2	Which blood cells carry oxygen?	["A. White blood cells", "B. Platelets", "C. Red blood cells", "D. Plasma"]	2	✅ Correct Answer: C. Red blood cells\n\nExplanation: Red blood cells contain hemoglobin, which transports oxygen.	t
25	2	Which organ produces insulin?	["A. Liver", "B. Pancreas", "C. Kidney", "D. Heart"]	1	✅ Correct Answer: B. Pancreas\n\nExplanation: Beta cells in the pancreas secrete insulin to regulate blood sugar.	t
26	2	Which part of the eye controls the amount of light entering?	["A. Retina", "B. Iris", "C. Lens", "D. Cornea"]	1	✅ Correct Answer: B. Iris\n\nExplanation: The iris changes pupil size to regulate light entry.	t
27	2	Which chamber pumps oxygenated blood to the body?	["A. Right atrium", "B. Right ventricle", "C. Left atrium", "D. Left ventricle"]	3	✅ Correct Answer: D. Left ventricle\n\nExplanation: The left ventricle pumps oxygen-rich blood into the aorta.	t
28	2	The smallest functional unit of the kidney is:	["A. Neuron", "B. Alveolus", "C. Nephron", "D. Osteon"]	2	✅ Correct Answer: C. Nephron\n\nExplanation: Each kidney contains about one million nephrons that filter blood.	t
29	2	Which blood vessel carries oxygenated blood from the lungs to the heart?	["A. Pulmonary artery", "B. Aorta", "C. Pulmonary vein", "D. Vena cava"]	2	✅ Correct Answer: C. Pulmonary vein\n\nExplanation: Pulmonary veins are unique because they carry oxygenated blood.	t
30	2	Which muscle is responsible for breathing?	["A. Biceps", "B. Triceps", "C. Diaphragm", "D. Deltoid"]	2	✅ Correct Answer: C. Diaphragm\n\nExplanation: When the diaphragm contracts, the lungs expand for inhalation.	t
31	2	Which organ stores bile produced by the liver?	["A. Pancreas", "B. Spleen", "C. Appendix", "D. Gallbladder"]	3	✅ Correct Answer: D\n\nExplanation: The gallbladder stores and concentrates bile until it is needed for fat digestion.	t
32	2	Which tissue connects muscle to bone?	["A. Ligament", "B. Tendon", "C. Cartilage", "D. Fascia"]	1	✅ Correct Answer: B\n\nExplanation: Tendons attach muscles to bones and transmit muscular force.	t
33	2	Which gland is known as the "master gland" of the endocrine system?	["A. Thyroid", "B. Adrenal", "C. Pituitary", "D. Pineal"]	2	✅ Correct Answer: C\n\nExplanation: The pituitary gland controls the activity of many other endocrine glands.	t
34	2	Which part of the brain coordinates balance and posture?	["A. Cerebellum", "B. Cerebrum", "C. Medulla oblongata", "D. Hypothalamus"]	0	✅ Correct Answer: A\n\nExplanation: The cerebellum is responsible for coordination, precision, and balance.	t
35	2	Which vitamin is essential for calcium absorption?	["A. Vitamin A", "B. Vitamin K", "C. Vitamin C", "D. Vitamin D"]	3	✅ Correct Answer: D\n\nExplanation: Vitamin D increases calcium absorption from the small intestine.	t
36	2	Which blood vessel carries oxygen-rich blood from the lungs to the heart?	["A. Pulmonary artery", "B. Pulmonary vein", "C. Superior vena cava", "D. Aorta"]	1	✅ Correct Answer: B\n\nExplanation: Pulmonary veins are the only veins that normally carry oxygenated blood.	t
37	2	Which cranial nerve is responsible for vision?	["A. Oculomotor nerve", "B. Trochlear nerve", "C. Optic nerve (CN II)", "D. Abducens nerve"]	2	✅ Correct Answer: C\n\nExplanation: The optic nerve carries visual information from the retina to the brain.	t
38	2	Which valve prevents blood from flowing back into the left atrium?	["A. Mitral (Bicuspid) valve", "B. Tricuspid valve", "C. Pulmonary valve", "D. Aortic valve"]	0	✅ Correct Answer: A\n\nExplanation: The mitral valve lies between the left atrium and left ventricle.	t
39	2	Which bone forms the forehead?	["A. Parietal bone", "B. Temporal bone", "C. Occipital bone", "D. Frontal bone"]	3	✅ Correct Answer: D\n\nExplanation: The frontal bone forms the forehead and the roof of the eye sockets.	t
40	2	Which immune cells produce antibodies?	["A. Neutrophils", "B. Plasma cells", "C. Macrophages", "D. Platelets"]	1	✅ Correct Answer: B\n\nExplanation: Plasma cells are differentiated B lymphocytes that secrete antibodies.	t
41	2	Which valve opens directly into the aorta?	["A. Mitral valve", "B. Pulmonary valve", "C. Aortic valve", "D. Tricuspid valve"]	2	✅ Correct Answer: C\n\nExplanation: Blood exits the left ventricle through the aortic valve.	t
42	2	Which hormone lowers blood glucose concentration?	["A. Insulin", "B. Glucagon", "C. Cortisol", "D. Epinephrine"]	0	✅ Correct Answer: A\n\nExplanation: Insulin promotes glucose uptake into body cells and lowers blood sugar.	t
43	2	Which region of the vertebral column contains 12 vertebrae?	["A. Cervical", "B. Lumbar", "C. Sacral", "D. Thoracic"]	3	✅ Correct Answer: D\n\nExplanation: The thoracic region consists of 12 vertebrae (T1–T12).	t
44	2	Which blood component is mainly responsible for clot formation?	["A. Red blood cells", "B. Platelets", "C. White blood cells", "D. Plasma"]	1	✅ Correct Answer: B\n\nExplanation: Platelets initiate clot formation and help stop bleeding.	t
45	2	What is the functional contractile unit of skeletal muscle?	["A. Myofibril", "B. Muscle fiber", "C. Sarcomere", "D. Fascicle"]	2	✅ Correct Answer: C\n\nExplanation: The sarcomere is the smallest functional unit responsible for muscle contraction.	t
46	2	Which artery supplies oxygenated blood directly to the heart muscle?	["A. Coronary artery", "B. Pulmonary artery", "C. Carotid artery", "D. Renal artery"]	0	✅ Correct Answer: A\n\nExplanation: Coronary arteries supply oxygen and nutrients to the myocardium.	t
20	2	Which organ is responsible for filtering blood?	["A. Liver", "B. Kidney", "C. Heart", "D. Stomach"]	1	✅ Correct Answer: B. Kidney\n\nExplanation: Kidneys remove waste products and excess water to produce urine.	t

\.

COPY "categories" FROM stdin;
1	Biology	2026-07-13 05:22:18.258242+00
9	Physiology	2026-07-16 09:57:23.024952+00
10	Anatomy	2026-07-16 09:58:00.059383+00

\.

COPY "content_pages" FROM stdin;
terms	\n\n\n\n\n\n\n\n<p class="p1"><b>Scoolam Terms and Conditions</b></p>\n<p class="p2"><b>Last updated: July 13, 2026</b></p>\n<p class="p3">Welcome to Scoolam. These Terms and Conditions ("Terms") govern your access to and use of the Scoolam</p>\n<p class="p3">mobile application, website, and related services (collectively, the "Service"), operated by Scoolam</p>\n<p class="p3">("Scoolam," "we," "us," or "our"). By creating an account, logging in, or otherwise using the Service, you</p>\n<p class="p3">agree to be bound by these Terms. If you do not agree, please do not use the Service.</p>\n<p class="p4"><b>1. Eligibility and Accounts</b></p>\n<p class="p3">1.1 You must be able to form a legally binding contract to create a Scoolam account. If you are under the age</p>\n<p class="p3">of majority in your jurisdiction, you may use Scoolam only with the involvement and consent of a parent or</p>\n<p class="p3">legal guardian.</p>\n<p class="p3">1.2 You may register using your email address, Google Sign-In, or Apple Sign-In (SSO). You are responsible</p>\n<p class="p3">for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.</p>\n<p class="p3">1.3 You agree to provide accurate registration information and to keep it up to date. Scoolam is not liable for</p>\n<p class="p3">any loss arising from your failure to protect your account credentials.</p>\n<p class="p3">1.4 Scoolam is an educational tool intended to support learning. It is not a substitute for classroom</p>\n<p class="p3">instruction, professional tutoring, or formal academic assessment.</p>\n<p class="p4"><b>2. Description of the Service</b></p>\n<p class="p3">Scoolam provides science and biology learning content, including:</p>\n<p class="p3"><span class="s1">● </span>Topic-based explainer videos with "Test Your Knowledge" quizzes</p>\n<p class="p3"><span class="s1">● </span>Downloadable infographics and worksheets</p>\n<p class="p3"><span class="s1">● </span>Interactive, tap-to-label worksheet games</p>\n<p class="p3"><span class="s1">● </span>A Daily Challenge of 30 multiple-choice questions, with results, ranking, and a shareable achievement</p>\n<p class="p3">certificate</p>\n<p class="p3"><span class="s1">● </span>3D anatomy video content</p>\n<p class="p3"><span class="s1">● </span>A dashboard showing personal progress, streaks, and rankings</p>\n<p class="p3">Content, features, and daily limits described in these Terms may change over time as Scoolam is updated.</p>\n<p class="p3">We will make reasonable efforts to notify users of material changes.</p>\n<p class="p4"><b>3. Subscription Plans</b></p>\n<p class="p3">Scoolam is offered under the following plans. Prices are shown in USD and may vary by region, app store, or</p>\n<p class="p3">promotion.<span class="s2"></span>### 3.1 Free Plan</p>\n<p class="p3"><span class="s1">● </span>30 daily multiple-choice questions</p>\n<p class="p3"><span class="s1">● </span>2 infographic downloads per day</p>\n<p class="p3"><span class="s1">● </span>1 worksheet download per day</p>\n<p class="p3"><span class="s1">● </span>1 video per week (with "Test Your Knowledge" access)</p>\n<p class="p3"><span class="s1">● </span>The Free plan includes advertising and does not include access to the Interactive Worksheet Game,</p>\n<p class="p3">which is shown in a locked state.</p>\n<p class="p3">### 3.2 Ads-free Plan — $2.99/month (or $25/year)</p>\n<p class="p3"><span class="s1">● </span>Everything included in the Free plan, without daily video/infographic/worksheet limits removed unless</p>\n<p class="p3">stated otherwise, plus:</p>\n<p class="p3"><span class="s1">● </span>No advertising</p>\n<p class="p3"><span class="s1">● </span>One daily 3D anatomy video, including "Test Your Knowledge"</p>\n<p class="p3"><span class="s1">● </span>Access to the Interactive Worksheet Game</p>\n<p class="p3"><span class="s1">● </span>The annual option ($25/year) is billed once per year and offers a discount versus paying monthly; the</p>\n<p class="p3">exact savings percentage will be shown at checkout and may change.</p>\n<p class="p3">### 3.3 Premium Plan — $30/month</p>\n<p class="p3">Everything included in the Ads-free plan, plus:</p>\n<p class="p3"><span class="s1">● </span>Unlimited infographic downloads</p>\n<p class="p3"><span class="s1">● </span>Unlimited worksheet downloads</p>\n<p class="p3"><span class="s1">● </span>Unlimited 3D anatomy videos, downloads, and practice questions</p>\n<p class="p3"><span class="s1">● </span>A limited license to reuse, repost, and publish downloaded content, which is provided watermark-free</p>\n<p class="p3">(see Section 7.3)</p>\n<p class="p3"><span class="s1">● </span>Access to the Deep 3D Anatomy Viewer once it becomes available ("Coming Soon" features are provided</p>\n<p class="p3">on an as-available basis and are not guaranteed by a specific date)</p>\n<p class="p3">### 3.4 Billing, Renewal, and Cancellation</p>\n<p class="p3"><span class="s1">● </span>Subscriptions automatically renew at the end of each billing period unless cancelled at least 24 hours</p>\n<p class="p3">before renewal.</p>\n<p class="p3"><span class="s1">● </span>You can manage or cancel your subscription at any time through your app store account settings (Apple</p>\n<p class="p3">App Store or Google Play) or, where applicable, directly within the Scoolam app.</p>\n<p class="p3"><span class="s1">● </span>Fees already charged for the current billing period are generally non-refundable, except where required</p>\n<p class="p3">by applicable law or app store policy.</p>\n<p class="p3"><span class="s1">● </span>We may change subscription pricing with advance notice. Continued use of a paid plan after a price</p>\n<p class="p3">change takes effect constitutes acceptance of the new price.<span class="s2"></span><span class="s3"><b>4. Acceptable Use</b></span></p>\n<p class="p3">You agree not to:</p>\n<p class="p3"><span class="s1">● </span>Share your account credentials or allow another person to use your paid subscription in a way that</p>\n<p class="p3">violates the app store's or Scoolam's account-sharing policies</p>\n<p class="p3"><span class="s1">● </span>Circumvent, disable, or interfere with any daily limit, paywall, watermark, or download restriction</p>\n<p class="p3"><span class="s1">● </span>Use automated tools (bots, scrapers) to access, download, or extract content from the Service</p>\n<p class="p3"><span class="s1">● </span>Copy, redistribute, or resell Free or Ads-free tier content beyond the personal, non-commercial use for</p>\n<p class="p3">which it is provided</p>\n<p class="p3"><span class="s1">● </span>Upload or transmit content through the Service that is unlawful, harassing, or infringes the rights of others</p>\n<p class="p3"><span class="s1">● </span>Attempt to reverse-engineer, decompile, or otherwise access the source code of the Service, except as</p>\n<p class="p3">permitted by law</p>\n<p class="p4"><b>5. Daily Challenge, Rankings, and Certificates</b></p>\n<p class="p3">5.1 The Daily Challenge, streaks, and ranking features reflect your activity within the app and are for</p>\n<p class="p3">motivational and educational purposes. They are not a certified or accredited academic record.</p>\n<p class="p3">5.2 Achievement certificates generated by Scoolam (including your name, score, and rank) are provided for</p>\n<p class="p3">personal use and voluntary sharing. By using the Share Achievement feature, you consent to the certificate</p>\n<p class="p3">image being generated and shared through the third-party platform you select (e.g., social media or</p>\n<p class="p3">messaging apps). Scoolam does not control how third-party platforms handle content once shared.</p>\n<p class="p3">5.3 You are responsible for the accuracy of the name and any personal details displayed on your certificate.</p>\n<p class="p4"><b>6. Content and Intellectual Property</b></p>\n<p class="p3">6.1 All videos, infographics, worksheets, quiz questions, 3D models, and other educational materials made</p>\n<p class="p3">available through Scoolam ("Content") are owned by Scoolam or its licensors and are protected by copyright</p>\n<p class="p3">and other intellectual property laws.</p>\n<p class="p3">6.2 <b>Free and Ads-free plans:</b> Content is licensed to you for personal, non-commercial, educational use</p>\n<p class="p3">only. You may not reproduce, redistribute, publish, or repost Content outside the app, and downloaded files</p>\n<p class="p3">may include a Scoolam watermark.</p>\n<p class="p3">6.3 <b>Premium plan license to reuse and repost:</b> Subject to your active Premium subscription and continued</p>\n<p class="p3">compliance with these Terms, Scoolam grants you a limited, non-exclusive, non-transferable, revocable</p>\n<p class="p3">license to download, reuse, repost, and publish Premium-tier Content, provided without a watermark,</p>\n<p class="p3">including on personal or professional channels (e.g., blogs, social media, classroom materials). This license:</p>\n<p class="p3"><span class="s1">● </span>Does not transfer ownership of the Content to you</p>\n<p class="p3"><span class="s1">● </span>Does not permit resale of the Content as a standalone product or its inclusion in a competing educational</p>\n<p class="p3">product or service<span class="s2"></span><span class="s1">● </span>Requires reasonable attribution to Scoolam where practical</p>\n<p class="p3"><span class="s1">● </span>Ends automatically if your Premium subscription lapses or is cancelled; you may keep and continue to</p>\n<p class="p3">use Content downloaded while your subscription was active, but new downloads under this license will no</p>\n<p class="p3">longer be available</p>\n<p class="p3">6.4 Scoolam, the Scoolam logo, and all related names and marks are trademarks of Scoolam. Nothing in</p>\n<p class="p3">these Terms grants you rights to use Scoolam's trademarks without prior written consent.</p>\n<p class="p4"><b>7. Third-Party Services</b></p>\n<p class="p3">The Service integrates with third-party providers, including Google Sign-In, Apple Sign-In, and app store</p>\n<p class="p3">billing (Apple App Store, Google Play). Your use of these features is also subject to the applicable third</p>\n<p class="p3">party's own terms and privacy policy.</p>\n<p class="p4"><b>8. Disclaimers</b></p>\n<p class="p3">8.1 The Service and Content are provided "as is" and "as available," without warranties of any kind, whether</p>\n<p class="p3">express or implied, including implied warranties of merchantability, fitness for a particular purpose, and</p>\n<p class="p3">non-infringement.</p>\n<p class="p3">8.2 Scoolam does not warrant that the Service will be uninterrupted, error-free, or completely secure, or that</p>\n<p class="p3">educational outcomes (such as exam results) will improve as a result of using the Service.</p>\n<p class="p3">8.3 "Coming Soon" features, including the Deep 3D Anatomy Viewer, are provided for informational</p>\n<p class="p3">purposes and may be delayed, modified, or discontinued prior to release.</p>\n<p class="p3">8.4 <b>Educational purpose only; content accuracy.</b> All Content on Scoolam — including videos,</p>\n<p class="p3">infographics, worksheets, quiz questions, and 3D anatomy models — is created for general educational and</p>\n<p class="p3">revision purposes only. While we take reasonable care in preparing and reviewing Content, we do not</p>\n<p class="p3">guarantee that it is complete, current, or free of errors or simplifications. Scientific and medical understanding</p>\n<p class="p3">evolves, and Content may not reflect the most recent research, guidelines, or terminology. You should</p>\n<p class="p3">independently verify any information that is important to you against authoritative textbooks, peer-reviewed</p>\n<p class="p3">sources, or a qualified professional before relying on it.</p>\n<p class="p3">8.5 <b>Not medical, clinical, or health advice.</b> Nothing on Scoolam constitutes medical advice, diagnosis, or</p>\n<p class="p3">treatment, and no Content should be used to diagnose, treat, cure, or prevent any disease or health</p>\n<p class="p3">condition, or to make any decision about your own or another person's health or medical care. Anatomy,</p>\n<p class="p3">physiology, and related biology Content is presented solely to support academic learning. Always seek the</p>\n<p class="p3">guidance of a qualified physician or other licensed healthcare provider with any questions you may have</p>\n<p class="p3">regarding a medical condition, and never disregard or delay seeking professional medical advice because of</p>\n<p class="p3">something you learned on Scoolam.</p>\n<p class="p3">8.6 <b>Not a substitute for supervised practical work.</b> Content describing or depicting experiments,</p>\n<p class="p3">dissections, laboratory techniques, procedures, or hands-on activities is illustrative and intended for</p>\n<p class="p3">conceptual understanding only. It is not a verified safety protocol or standard operating procedure. Do not<span class="s2"></span>attempt to replicate any home experiment, laboratory procedure, dissection, clinical technique, or other</p>\n<p class="p3">practical activity based solely on Scoolam Content, without the direct supervision of a qualified teacher,</p>\n<p class="p3">laboratory instructor, or licensed professional, appropriate safety equipment, and any required institutional</p>\n<p class="p3">approval. You are solely responsible for assessing the safety and suitability of any practical activity before</p>\n<p class="p3">undertaking it.</p>\n<p class="p3">8.7 <b>Not a substitute for accredited instruction or workplace guidance.</b> Scoolam is a supplementary</p>\n<p class="p3">learning tool and is not a substitute for accredited coursework, certified professional training,</p>\n<p class="p3">examination-board syllabi, or instructions provided by your school, employer, or a licensed institution.</p>\n<p class="p3">Content should not be treated as authoritative guidance for real-life academic assessment, office, clinical,</p>\n<p class="p3">laboratory, or other professional settings. Any decisions or actions you take in an academic, medical,</p>\n<p class="p3">laboratory, workplace, or other real-world context based on Scoolam Content are taken entirely at your own</p>\n<p class="p3">risk.</p>\n<p class="p3">8.8 <b>No liability for reliance.</b> To the maximum extent permitted by law, Scoolam disclaims all liability for any</p>\n<p class="p3">injury, illness, loss, or damage of any kind arising from reliance on Content, or from any experiment, practical</p>\n<p class="p3">activity, medical decision, or other real-world action undertaken on the basis of Content made available</p>\n<p class="p3">through the Service. Parents, guardians, and educators supervising minors' use of Scoolam are responsible</p>\n<p class="p3">for ensuring Content is applied appropriately and safely.</p>\n<p class="p4"><b>9. Limitation of Liability</b></p>\n<p class="p3">To the maximum extent permitted by applicable law, Scoolam and its officers, employees, and licensors will</p>\n<p class="p3">not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of data,</p>\n<p class="p3">revenue, or goodwill, arising from your use of or inability to use the Service, even if advised of the possibility</p>\n<p class="p3">of such damages. Scoolam's total liability for any claim arising from these Terms or the Service will not</p>\n<p class="p3">exceed the amount you paid to Scoolam in the twelve (12) months preceding the claim.</p>\n<p class="p4"><b>10. Termination</b></p>\n<p class="p3">We may suspend or terminate your account if you violate these Terms, misuse the Service, or engage in</p>\n<p class="p3">conduct that we determine, in our reasonable judgment, is harmful to Scoolam or other users. You may stop</p>\n<p class="p3">using the Service and delete your account at any time. Sections of these Terms that by their nature should</p>\n<p class="p3">survive termination (including Sections 6, 8, 9, and 11) will continue to apply.</p>\n<p class="p4"><b>11. Changes to These Terms</b></p>\n<p class="p3">We may update these Terms from time to time. If we make material changes, we will provide notice through</p>\n<p class="p3">the app or by email before the changes take effect. Continued use of the Service after changes take effect</p>\n<p class="p3">constitutes acceptance of the revised Terms.</p>\n<p class="p3"><span class="s3"><b>12. Governing Law</b></span><span class="s2"></span>These Terms are governed by the laws of the jurisdiction in which Scoolam is registered to do business,</p>\n<p class="p3">without regard to conflict-of-law principles, except where applicable local consumer protection law requires</p>\n<p class="p3">otherwise.</p>\n<p class="p4"><b>13. Contact and Support</b></p>\n<p class="p3">If you have questions about these Terms, need help with your account or subscription, or want to report an</p>\n<p class="p3">issue with the Service, please contact us:</p>\n<p class="p3"><b>Email:</b> scoolam24@gmail.com</p>\n<p class="p3">We aim to respond to support requests as promptly as possible.</p>\n<p class="p5">These Terms and Conditions are a template prepared for Scoolam's product planning purposes. Before publishing them</p>\n<p class="p5">publicly or linking them in the live app, please have them reviewed by a qualified lawyer familiar with app store</p>\n<p class="p5">requirements and the laws of the regions where Scoolam operates, particularly regarding subscription billing disclosures,</p>\n<p class="p5">the Premium content-reuse license, and any rules on collecting data from users who may be minors.</p>	2026-07-15 05:25:01.480772+00
privacy	<!--StartFragment--><h2 class="text-text-100 mt-3 -mb-1 text-[1.375rem] font-bold">Privacy Policy and Data Usage</h2>\n<p class="font-claude-response-body break-words whitespace-normal"><strong>Last updated: July 13, 2026</strong></p>\n<p class="font-claude-response-body break-words whitespace-normal">This Privacy Policy explains how Scoolam ("Scoolam," "we," "us," or "our") collects, uses, shares, and protects information when you use the Scoolam mobile application, website, and related services (the "Service"). It should be read alongside our Terms and Conditions. By using Scoolam, you agree to the practices described in this Policy.</p>\n<hr class="border-border-200 border-t-0.5 my-3 mx-1.5">\n<h3 class="text-text-100 mt-3 -mb-1 text-[1.125rem] font-bold">1. Information We Collect</h3>\n<h4 class="text-text-100 mt-2 -mb-1 text-base font-bold">1.1 Information you provide directly</h4>\n<ul class="[li_&amp;]:mb-0 [li_&amp;]:mt-1 [li_&amp;]:gap-1 [&amp;:not(:last-child)_ul]:pb-1 [&amp;:not(:last-child)_ol]:pb-1 list-disc flex flex-col gap-1 pl-8 mb-3">\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Account information:</strong> your email address and password (if you register with email), or your name, email address, and a unique account identifier provided by Google Sign-In or Apple Sign-In (SSO) if you use those options.</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Profile and certificate information:</strong> the display name shown on your dashboard, achievement certificates, and rankings.</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Support communications:</strong> anything you send us when you contact <a class="underline underline underline-offset-2 decoration-1 decoration-current/40 hover:decoration-current focus:decoration-current" href="mailto:scoolam24@gmail.com">scoolam24@gmail.com</a>, including your email address and the content of your message.</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Payment-related information:</strong> if you subscribe to Ads-free or Premium, your purchase is processed by the Apple App Store or Google Play. Scoolam does not collect or store your full card or payment account details; we receive limited transaction information (such as subscription status, plan, and renewal date) from the app store.</li>\n</ul>\n<h4 class="text-text-100 mt-2 -mb-1 text-base font-bold">1.2 Information collected automatically</h4>\n<ul class="[li_&amp;]:mb-0 [li_&amp;]:mt-1 [li_&amp;]:gap-1 [&amp;:not(:last-child)_ul]:pb-1 [&amp;:not(:last-child)_ol]:pb-1 list-disc flex flex-col gap-1 pl-8 mb-3">\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Usage data:</strong> videos watched, infographics and worksheets downloaded, Daily Challenge and quiz scores, streaks, interactive worksheet game results, and general in-app navigation.</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Device and technical data:</strong> device type, operating system and version, app version, language settings, and general diagnostic/crash data.</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Approximate location:</strong> derived from your IP address or device settings, used only to the extent needed for regional pricing, language defaults, or legal compliance — not precise GPS location.</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Advertising data (Free plan only):</strong> if you are on the Free plan, our advertising partners may collect device identifiers and usage signals to serve and measure ads, as described in Section 5.</li>\n</ul>\n<h4 class="text-text-100 mt-2 -mb-1 text-base font-bold">1.3 Information from third parties</h4>\n<p class="font-claude-response-body break-words whitespace-normal">If you sign in using Google or Apple SSO, we receive the basic profile information those providers share with us under your permission (typically name, email address, and a unique identifier). We do not receive your Google or Apple password.</p>\n<hr class="border-border-200 border-t-0.5 my-3 mx-1.5">\n<h3 class="text-text-100 mt-3 -mb-1 text-[1.125rem] font-bold">2. How We Use Your Information</h3>\n<p class="font-claude-response-body break-words whitespace-normal">We use the information described above to:</p>\n<ul class="[li_&amp;]:mb-0 [li_&amp;]:mt-1 [li_&amp;]:gap-1 [&amp;:not(:last-child)_ul]:pb-1 [&amp;:not(:last-child)_ol]:pb-1 list-disc flex flex-col gap-1 pl-8 mb-3">\n<li class="font-claude-response-body whitespace-normal break-words pl-2">Create and maintain your account and keep you signed in across sessions</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2">Operate core features: track videos watched, MCQs completed, streaks, weekly ranking, and Daily Challenge results</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2">Generate your dashboard statistics and achievement certificates, and support the Share Achievement feature</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2">Apply the correct daily/weekly limits for your plan (Free, Ads-free, or Premium) and unlock the features your subscription includes</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2">Process subscription purchases, renewals, and cancellations through the Apple App Store or Google Play</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2">Provide customer support and respond to your questions</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2">Maintain the security of the Service, prevent fraud, and enforce our Terms and Conditions, including limits on account sharing and content redistribution</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2">Serve and measure advertising on the Free plan (see Section 5)</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2">Analyze aggregated, de-identified usage trends to improve the Service and develop new features</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2">Send you service-related communications (e.g., renewal reminders, changes to these policies); marketing communications are sent only if you opt in, and you may opt out at any time</li>\n</ul>\n<hr class="border-border-200 border-t-0.5 my-3 mx-1.5">\n<h3 class="text-text-100 mt-3 -mb-1 text-[1.125rem] font-bold">3. Legal Basis for Processing (EEA/UK Users)</h3>\n<p class="font-claude-response-body break-words whitespace-normal">If you are located in the European Economic Area or United Kingdom, we process your information on the following legal bases: performance of a contract (to provide the Service you signed up for), legitimate interests (such as improving the Service and preventing misuse), consent (for optional marketing communications and, where required, advertising), and compliance with legal obligations.</p>\n<hr class="border-border-200 border-t-0.5 my-3 mx-1.5">\n<h3 class="text-text-100 mt-3 -mb-1 text-[1.125rem] font-bold">4. How We Share Information</h3>\n<p class="font-claude-response-body break-words whitespace-normal">We do not sell your personal information. We share information only in the following circumstances:</p>\n<ul class="[li_&amp;]:mb-0 [li_&amp;]:mt-1 [li_&amp;]:gap-1 [&amp;:not(:last-child)_ul]:pb-1 [&amp;:not(:last-child)_ol]:pb-1 list-disc flex flex-col gap-1 pl-8 mb-3">\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Service providers:</strong> cloud hosting, analytics, customer support, and infrastructure vendors who process data on our behalf and are bound by confidentiality and data protection obligations.</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Authentication providers:</strong> Google and Apple, solely to enable SSO login as described in Section 1.3.</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>App store platforms:</strong> Apple App Store and Google Play, to process subscription payments and manage your purchase.</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Advertising partners (Free plan only):</strong> to serve and measure in-app ads, as described in Section 5.</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Legal and safety reasons:</strong> if required by law, regulation, legal process, or governmental request, or where we believe disclosure is necessary to protect the rights, property, or safety of Scoolam, our users, or the public.</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Business transfers:</strong> if Scoolam is involved in a merger, acquisition, or sale of assets, information may be transferred as part of that transaction, subject to this Policy or a successor policy with equivalent protections.</li>\n</ul>\n<p class="font-claude-response-body break-words whitespace-normal">We do not control what happens to a certificate or other content once you actively choose to share it to a third-party platform (such as social media or a messaging app) using the Share Achievement feature; that sharing is governed by the third-party platform's own terms and privacy policy.</p>\n<hr class="border-border-200 border-t-0.5 my-3 mx-1.5">\n<h3 class="text-text-100 mt-3 -mb-1 text-[1.125rem] font-bold">5. Advertising and the Free Plan</h3>\n<p class="font-claude-response-body break-words whitespace-normal">The Free plan is supported by advertising. If you are on the Free plan, third-party advertising partners may collect and use device identifiers, approximate location, and usage data to select, deliver, and measure ads, and to limit how many times you see the same ad. Upgrading to the Ads-free plan or Premium plan removes in-app advertising and stops this data sharing with advertising partners going forward.</p>\n<p class="font-claude-response-body break-words whitespace-normal">Where required by applicable law, we will request your consent before enabling advertising-related data collection, and you may be able to limit ad tracking through your device's operating system settings (for example, "Limit Ad Tracking" or "Opt out of Ads Personalization").</p>\n<hr class="border-border-200 border-t-0.5 my-3 mx-1.5">\n<h3 class="text-text-100 mt-3 -mb-1 text-[1.125rem] font-bold">6. Children's Privacy</h3>\n<p class="font-claude-response-body break-words whitespace-normal">Scoolam is an educational app that may be used by school-age learners under the supervision of a parent, guardian, or educator, consistent with Section 1.1 of our Terms and Conditions.</p>\n<ul class="[li_&amp;]:mb-0 [li_&amp;]:mt-1 [li_&amp;]:gap-1 [&amp;:not(:last-child)_ul]:pb-1 [&amp;:not(:last-child)_ol]:pb-1 list-disc flex flex-col gap-1 pl-8 mb-3">\n<li class="font-claude-response-body whitespace-normal break-words pl-2">We do not knowingly collect more personal information from a child than is reasonably necessary to provide the Service (for example, an account identifier, a display name for the dashboard and certificates, and usage/progress data).</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2">We do not knowingly enable behaviorally targeted advertising to users we know to be children under the age required for such advertising under applicable law; where we have actual knowledge a user is a child, advertising served to that account is limited to contextual, non-behavioral advertising to the extent required by law.</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2">Parents and guardians who believe their child has provided us with personal information beyond what is described in this Policy, or who wish to review, correct, or delete their child's information, can contact us at <strong><a class="underline underline underline-offset-2 decoration-1 decoration-current/40 hover:decoration-current focus:decoration-current" href="mailto:scoolam24@gmail.com">scoolam24@gmail.com</a></strong>, and we will take appropriate steps to verify the request and respond.</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2">Schools or educators setting up accounts on behalf of students are responsible for obtaining any consents required under applicable education-privacy laws in their region before doing so.</li>\n</ul>\n<hr class="border-border-200 border-t-0.5 my-3 mx-1.5">\n<h3 class="text-text-100 mt-3 -mb-1 text-[1.125rem] font-bold">7. Data Retention</h3>\n<p class="font-claude-response-body break-words whitespace-normal">We retain your account and usage information for as long as your account is active, and for a reasonable period afterward to comply with legal obligations, resolve disputes, enforce our agreements, and maintain business records. If you delete your account, we will delete or anonymize your personal information within a reasonable timeframe, except where retention is required by law or for legitimate business purposes such as fraud prevention.</p>\n<hr class="border-border-200 border-t-0.5 my-3 mx-1.5">\n<h3 class="text-text-100 mt-3 -mb-1 text-[1.125rem] font-bold">8. Your Rights and Choices</h3>\n<p class="font-claude-response-body break-words whitespace-normal">Depending on your location, you may have the right to:</p>\n<ul class="[li_&amp;]:mb-0 [li_&amp;]:mt-1 [li_&amp;]:gap-1 [&amp;:not(:last-child)_ul]:pb-1 [&amp;:not(:last-child)_ol]:pb-1 list-disc flex flex-col gap-1 pl-8 mb-3">\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Access</strong> the personal information we hold about you</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Correct</strong> inaccurate or incomplete information, including your display name</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Delete</strong> your account and associated personal information</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Export</strong> your data in a portable format</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Object to or restrict</strong> certain processing, including advertising-related data use</li>\n<li class="font-claude-response-body whitespace-normal break-words pl-2"><strong>Withdraw consent</strong> at any time where processing is based on consent, without affecting the lawfulness of processing before withdrawal</li>\n</ul>\n<p class="font-claude-response-body break-words whitespace-normal">To exercise any of these rights, contact us at <strong><a class="underline underline underline-offset-2 decoration-1 decoration-current/40 hover:decoration-current focus:decoration-current" href="mailto:scoolam24@gmail.com">scoolam24@gmail.com</a></strong>. We may need to verify your identity before completing certain requests. You also have the right to lodge a complaint with your local data protection authority.</p>\n<hr class="border-border-200 border-t-0.5 my-3 mx-1.5">\n<h3 class="text-text-100 mt-3 -mb-1 text-[1.125rem] font-bold">9. Data Security</h3>\n<p class="font-claude-response-body break-words whitespace-normal">We use reasonable administrative, technical, and organizational safeguards designed to protect your information from unauthorized access, disclosure, alteration, or destruction, including encryption of data in transit and access controls on our systems. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>\n<hr class="border-border-200 border-t-0.5 my-3 mx-1.5">\n<h3 class="text-text-100 mt-3 -mb-1 text-[1.125rem] font-bold">10. International Data Transfers</h3>\n<p class="font-claude-response-body break-words whitespace-normal">Scoolam may process and store information in countries other than your own. Where we transfer personal information internationally, we take steps to ensure it receives an adequate level of protection, including through standard contractual clauses or equivalent safeguards required by applicable law.</p>\n<hr class="border-border-200 border-t-0.5 my-3 mx-1.5">\n<h3 class="text-text-100 mt-3 -mb-1 text-[1.125rem] font-bold">11. Cookies and Similar Technologies</h3>\n<p class="font-claude-response-body break-words whitespace-normal">Our website and app may use cookies, SDKs, and similar technologies to keep you signed in, remember your preferences, measure app performance, and, on the Free plan, support advertising. You can control cookies through your browser settings, and certain in-app tracking through your device's privacy settings; disabling some technologies may affect how the Service functions.</p>\n<hr class="border-border-200 border-t-0.5 my-3 mx-1.5">\n<h3 class="text-text-100 mt-3 -mb-1 text-[1.125rem] font-bold">12. Changes to This Policy</h3>\n<p class="font-claude-response-body break-words whitespace-normal">We may update this Privacy Policy from time to time. If we make material changes, we will provide notice through the app or by email before the changes take effect. The "Last updated" date at the top of this Policy reflects the most recent revision. Continued use of the Service after changes take effect constitutes acceptance of the revised Policy.</p>\n<hr class="border-border-200 border-t-0.5 my-3 mx-1.5">\n<h3 class="text-text-100 mt-3 -mb-1 text-[1.125rem] font-bold">13. Contact Us</h3>\n<p class="font-claude-response-body break-words whitespace-normal">If you have questions about this Privacy Policy, want to exercise your data rights, or have concerns about how your information is handled, please contact us:</p>\n<p class="font-claude-response-body break-words whitespace-normal"><strong>Email:</strong> <a class="underline underline underline-offset-2 decoration-1 decoration-current/40 hover:decoration-current focus:decoration-current" href="mailto:scoolam24@gmail.com">scoolam24@gmail.com</a></p>\n<p class="font-claude-response-body break-words whitespace-normal">We aim to respond to privacy-related requests as promptly as possible.</p><!--EndFragment--><!--EndFragment-->	2026-07-15 05:47:25.450986+00

\.

COPY "app_settings" FROM stdin;
free_limits	{"mcqs_per_day": 5, "videos_per_day": 2, "worksheets_per_day": 2, "infographics_per_day": 3}	2026-07-16 08:43:26.464072+00
payment_gateway	{"stripe_webhook_secret": "", "stripe_publishable_key": ""}	2026-07-19 07:33:31.301249+00
revenuecat_config	{"offering_id": "default", "entitlement_id": "premium"}	2026-07-22 19:41:05.12945+00

\.
