--
-- PostgreSQL database dump
--

-- Dumped from database version 14.9 (Ubuntu 14.9-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.9 (Ubuntu 14.9-0ubuntu0.22.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.locations_maintainers DROP CONSTRAINT maintainer_id;
ALTER TABLE ONLY public.locations_maintainers DROP CONSTRAINT location_id;
ALTER TABLE ONLY public.maintainers DROP CONSTRAINT maintainers_pkey;
ALTER TABLE ONLY public.locations DROP CONSTRAINT locations_pkey;
ALTER TABLE ONLY public.locations_maintainers DROP CONSTRAINT locations_maintainers_pkey;
DROP TABLE public.maintainers;
DROP TABLE public.locations_maintainers;
DROP TABLE public.locations;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: locations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations (
    id integer NOT NULL,
    name character varying(100),
    natural_source boolean NOT NULL,
    geolocation_latitude numeric(9,6) NOT NULL,
    geolocation_longitude numeric(9,6) NOT NULL,
    geolocation_altitude numeric(6,2) NOT NULL,
    year_of_opening integer
);


ALTER TABLE public.locations OWNER TO postgres;

--
-- Name: locations_maintainers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.locations_maintainers (
    id integer NOT NULL,
    location_id integer NOT NULL,
    maintainer_id integer NOT NULL
);


ALTER TABLE public.locations_maintainers OWNER TO postgres;

--
-- Name: maintainers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintainers (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    street character varying(100) NOT NULL,
    city character varying(100) NOT NULL,
    province character varying(100) NOT NULL,
    country character varying(100) NOT NULL
);


ALTER TABLE public.maintainers OWNER TO postgres;

--
-- Data for Name: locations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations (id, name, natural_source, geolocation_latitude, geolocation_longitude, geolocation_altitude, year_of_opening) FROM stdin;
2	Francek	f	45.810339	15.978541	128.00	2004
1	Francek	f	45.820141	16.016171	125.10	2005
3	Francek	f	45.829850	16.027303	137.20	2004
4	Francek	f	45.802842	15.973013	118.30	2006
5	Kobiljak	t	45.835316	15.887524	248.00	\N
6	Raspelo	t	45.866636	15.974636	305.60	\N
7	Vidovec	t	45.912108	15.895328	314.20	\N
8	Pojilo	t	45.938071	16.045869	291.70	\N
9	\N	t	45.842829	15.886123	327.50	\N
10	Francek	f	45.795965	15.982229	115.00	\N
\.


--
-- Data for Name: locations_maintainers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.locations_maintainers (id, location_id, maintainer_id) FROM stdin;
1	1	1
2	2	1
3	3	1
4	4	1
5	5	2
6	6	2
7	7	2
8	8	2
9	9	2
10	10	1
11	6	3
12	7	3
13	8	3
14	9	3
\.


--
-- Data for Name: maintainers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintainers (id, name, street, city, province, country) FROM stdin;
1	Vodoopskrba i odvodnja d.o.o.	Folnegovićeva 1	Zagreb	Grad Zagreb	Croatia
2	Hrvatske vode	Ulica Grada Vukovara 220	Zagreb	Grad Zagreb	Croatia
3	Park prirode Medvednica	Bliznec 70	Zagreb	Grad Zagreb	Croatia
\.


--
-- Name: locations_maintainers locations_maintainers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations_maintainers
    ADD CONSTRAINT locations_maintainers_pkey PRIMARY KEY (id);


--
-- Name: locations locations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations
    ADD CONSTRAINT locations_pkey PRIMARY KEY (id);


--
-- Name: maintainers maintainers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintainers
    ADD CONSTRAINT maintainers_pkey PRIMARY KEY (id);


--
-- Name: locations_maintainers location_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations_maintainers
    ADD CONSTRAINT location_id FOREIGN KEY (location_id) REFERENCES public.locations(id);


--
-- Name: locations_maintainers maintainer_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.locations_maintainers
    ADD CONSTRAINT maintainer_id FOREIGN KEY (maintainer_id) REFERENCES public.maintainers(id);


--
-- PostgreSQL database dump complete
--

