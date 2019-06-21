-- Exported from QuickDBD: https://www.quickdatatabasediagrams.com/
-- Link to schema: https://app.quickdatabasediagrams.com/#/d/Ozo4GI
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.


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
    "uporabniski_hash" bytea  NOT NULL,
    "izdajatelj_racuna" varchar(255)   NOT NULL,
    "datum" date   NOT NULL,
    "znesek_z_ddv" real   NOT NULL,
    "ddv" real NULL,
    "xml_path" varchar(255) NULL,
    CONSTRAINT "pk_racuni" PRIMARY KEY (
        "uporabniski_hash"
     )
);

ALTER TABLE "racuni" ADD CONSTRAINT "fk_racuni_uporabniskiHash" FOREIGN KEY("uporabniski_hash")
REFERENCES "uporabniki" ("uporabniski_hash");
