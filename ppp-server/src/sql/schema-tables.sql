-- Drop existing tables if they exist (for reset purposes)
DROP TABLE IF EXISTS user_responses;
DROP TABLE IF EXISTS aptitude_questions;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS aptitude_tests;
DROP TABLE IF EXISTS users;

-- Table: Users
CREATE TABLE IF NOT EXISTS public.users
(
    regno character varying(7) COLLATE pg_catalog."default" NOT NULL,
    name character varying(50) COLLATE pg_catalog."default" NOT NULL,
    trade character varying(3) COLLATE pg_catalog."default",
    batch character varying(4) COLLATE pg_catalog."default",
    role character varying(10) COLLATE pg_catalog."default" NOT NULL,
    last_active timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    access_token character varying(255) COLLATE pg_catalog."default",
    avatar text COLLATE pg_catalog."default" NOT NULL DEFAULT 'https://res.cloudinary.com/dejbo7uw5/image/upload/v1711738910/avatar/ayl1ptnlmgi43ymkipv6.jpg'::text,
    blocked integer DEFAULT 0,
    mobile character(10) COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (regno)
);


-- Table: AptitudeTests
CREATE TABLE IF NOT EXISTS public.aptitude_tests
(
    id integer NOT NULL DEFAULT nextval('aptitudetests_id_seq'::regclass),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    test_timestamp character varying(30) COLLATE pg_catalog."default",
    duration integer,
    total_questions integer NOT NULL DEFAULT 0,
    CONSTRAINT aptitudetests_pkey PRIMARY KEY (id)
);

-- Table: Questions
CREATE TABLE IF NOT EXISTS public.questions
(
    id serial NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    topic_tags text[] COLLATE pg_catalog."default",
    question_type character varying(50) COLLATE pg_catalog."default" NOT NULL,
    last_used character varying(30) COLLATE pg_catalog."default",
    difficulty_level integer NOT NULL,
    options text[] COLLATE pg_catalog."default" NOT NULL,
    correct_option integer[] NOT NULL,
    format character varying(4) COLLATE pg_catalog."default",
    CONSTRAINT questions_pkey PRIMARY KEY (id)
);


-- Table: AptitudeQuestions

CREATE TABLE IF NOT EXISTS public.aptitude_questions
(
    id integer NOT NULL DEFAULT nextval('aptitudequestions_id_seq'::regclass),
    aptitude_test_id integer NOT NULL,
    question_id integer NOT NULL,
    CONSTRAINT aptitudequestions_pkey PRIMARY KEY (id)
);



-- Table: UserResponses

CREATE TABLE IF NOT EXISTS public.user_responses
(
    id integer NOT NULL DEFAULT nextval('userresponses_id_seq'::regclass),
    regno character varying(7) COLLATE pg_catalog."default" NOT NULL,
    aptitude_test_id integer NOT NULL,
    answers text COLLATE pg_catalog."default" NOT NULL,
    response_time character varying(30) COLLATE pg_catalog."default" DEFAULT CURRENT_TIMESTAMP,
    marks integer DEFAULT 0,
    CONSTRAINT userresponses_pkey PRIMARY KEY (id)
);


-- Table: JSPRS
CREATE TABLE IF NOT EXISTS public.jsprs
(
    id serial NOT NULL,
    regno character varying(7) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT jsprs_pkey PRIMARY KEY (id),
    CONSTRAINT unique_regno UNIQUE (regno)
);



-- DSA Sheet Questions
CREATE TABLE dsa_questions (
    id SERIAL PRIMARY KEY,
   name TEXT NOT NULL,
   link TEXT NOT NULL,
   folder TEXT NOT NULL,
   order INT NOT NULL
);

-- DSA Sheet Solved Questions
CREATE TABLE dsa_solved (
    id SERIAL PRIMARY KEY,
    regno VARCHAR(7) NOT NULL REFERENCES Users(regno) ON DELETE CASCADE,
    question_id INT NOT NULL REFERENCES dsa_questions(id) ON DELETE CASCADE,
);

ALTER TABLE IF EXISTS public.aptitude_questions
    ADD CONSTRAINT aptitudequestions_aptitude_test_id_fkey FOREIGN KEY (aptitude_test_id)
    REFERENCES public.aptitude_tests (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.aptitude_questions
    ADD CONSTRAINT aptitudequestions_question_id_fkey FOREIGN KEY (question_id)
    REFERENCES public.questions (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.aptitude_questions
    ADD CONSTRAINT fk_question FOREIGN KEY (question_id)
    REFERENCES public.questions (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.jsprs
    ADD CONSTRAINT jsprs_regno_fkey FOREIGN KEY (regno)
    REFERENCES public.users (regno) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS unique_regno
    ON public.jsprs(regno);

ALTER TABLE IF EXISTS public.user_responses
    ADD CONSTRAINT userresponses_aptitude_test_id_fkey FOREIGN KEY (aptitude_test_id)
    REFERENCES public.aptitude_tests (id) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;


ALTER TABLE IF EXISTS public.user_responses
    ADD CONSTRAINT userresponses_registration_no_fkey FOREIGN KEY (regno)
    REFERENCES public.users (regno) MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

