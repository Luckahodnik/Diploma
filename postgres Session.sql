
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "uporabniki" (
    "uporabniski_hash" bytea   NOT NULL,
    "uporabnisko_ime" varchar(30)   NOT NULL,
    "geslo_hash" bytea   NOT NULL,
    "geslo_salt" bytea   NOT NULL,
    "ime" varchar(60)  NULL,
    "priimek" varchar(60)  NULL,
    "email" varchar(128)   NOT NULL,
    "slika_path" varchar(255)   NULL,
    CONSTRAINT "pk_uporabniki" PRIMARY KEY (
        "uporabniski_hash"
     )
);

CREATE TABLE "racuni" (
    "id_racuna" uuid NOT NULL,
    "uporabniski_hash" bytea  NOT NULL,
    "izdajatelj_racuna" varchar(255)   NOT NULL,
    "datum" date   NOT NULL,
    "znesek_z_ddv" real   NOT NULL,
    "ddv" real NULL,
    "xml_path" varchar(255) NULL,
    
    CONSTRAINT "pk_racuni" PRIMARY KEY (
        "id_racuna"
     )
);

ALTER TABLE "racuni" ADD CONSTRAINT "fk_racuni_uporabniski_hash" FOREIGN KEY("uporabniski_hash")
REFERENCES "uporabniki" ("uporabniski_hash");
