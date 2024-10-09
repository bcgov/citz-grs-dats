# Digital Archive Transfer Service - DATS

[![Lifecycle:Experimental](https://img.shields.io/badge/Lifecycle-Experimental-339999)](Redirect-URL)

The DATS project will be transferring inactive Full Retention (FR) government digital records and metadata to be archived, according to approved Information Schedules.

<br />

## Quick Start

1. Set up the `.env` based on the `.env.template` file.

2. Run `npm run up` to start the API, MongoDB, and RabbitMQ services.

3. Change directory to `desktop` and run `npm run dev` to launch the desktop app.

<br />

## Architecture Diagram

```mermaid
graph TD
    %% Define the architecture components
    subgraph Client["Client"]
        style Client fill:#D0E8F2,stroke:#3B82F6,stroke-width:2px
        A1[Electron React App]
    end

    subgraph OpenShift["OpenShift Environment"]
        style OpenShift fill:#F3F4F6,stroke:#6B7280,stroke-width:2px
        direction TB
        A1 -.->|Must be on VPN or BC Gov Network| B[Express API]
        B -->|Queue Requests| C[RabbitMQ]
        B -->|Store Metadata| D[MongoDB]
        B -->|Store Files| E[S3 Bucket]
    end

    %% Define external connections
    C -->|Process Queue| B
