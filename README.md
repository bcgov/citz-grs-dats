# Digital Archive Transfer Service - DATS

The DATS project will be collecting inactive Full Retention (FR) government digital records and metadata to be archived, according to approved Information Schedules.

DATS acted has a Aggragetor for differentes sources of Digital Records coming from the Ministry employes (Producer).

DATS will export the Transfer into structured Pre-Soumission Package (PSP), so the Archivistes will be able to review them and create SIP to be ingest in the SaaS Archive Solution

## Components

1. Database (MongoDB): Stores all admin and Technical Metadata files, converted to JSON, for each Transfer/Classification in t.
2. Backend (Node/Express API): Provides read and write access to the database. The read endpoint is open to the public, while the write endpoint is protected by an API key. Both are rate-limited.
3. Frontend (React.js and MaterialUI): Allows users to create bcgovpubcode.yml files or edit existing ones using a GitHub link.
4. Schema (JSON Schema): The standard on which the bcgovpubcode.yml file is based.

# DATS Architecture

![image](https://github.com/bcgov/citz-grs-dats/assets/150071375/44e9b1a9-2ece-4a49-a9b8-6992b0059604)
