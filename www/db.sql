-- Exported from QuickDBD: https://www.quickdatatabasediagrams.com/
-- Link to schema: https://app.quickdatabasediagrams.com/#/d/Ozo4GI
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.


CREATE TABLE "Uporabniki" (
    "UporabniskiHash" binary(128)   NOT NULL,
    "UporabniskoIme" varchar(30)   NOT NULL,
    "GesloHash" binary(128)   NOT NULL,
    "GesloSalt" binary(128)   NOT NULL,
    "Ime" varchar(60)  NULL,
    "Priimek" varchar(60)  NULL,
    "Email" varchar(128)   NOT NULL,
    "SlikaPath" varchar(255)   NULL,
    CONSTRAINT "pk_Uporabniki" PRIMARY KEY (
        "UporabniskiHash"
     )
);

CREATE TABLE "Racuni" (
    "UporabniskiHash" binary(128)   NOT NULL,
    "IzdajateljRacuna" varchar(255)   NOT NULL,
    "Datum" date   NOT NULL,
    "ZnesekZDDV" real   NOT NULL,
    "DDV" real NULL,
    "XMLPath" varchar(255) NULL,
    CONSTRAINT "pk_Racuni" PRIMARY KEY (
        "UporabniskiHash"
     )
);

ALTER TABLE "Racuni" ADD CONSTRAINT "fk_Racuni_UporabniskiHash" FOREIGN KEY("UporabniskiHash")
REFERENCES "Uporabniki" ("UporabniskiHash");
