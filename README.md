# Digital Archive Transfer Service - DATS

[![Lifecycle:Experimental](https://img.shields.io/badge/Lifecycle-Experimental-339999)](Redirect-URL)

The DATS project will be transferring inactive Full Retention (FR) government digital records and metadata to be archived, according to approved Information Schedules.

<br />

## Quick Start

1. **Set Up Environment**: Set up the `.env` based on the `.env.template` file.

2. **Start Services**: Run `npm run up` to start the API, MongoDB, and RabbitMQ services.

3. **Desktop Directory**: Navigate to `desktop`.

4. **Install Dependencies**: Run `npm install`.

5. **Build App**: Run `npm run build` to enable worker functionality.

6. **Launch App**: Run `npm run dev`.

### Next Steps

- [Change API URL](#change-api-url)
- [Test Desktop App Executable](#test-desktop-app-executable)

<br />

## Change API URL

To switch API environments:

1. In the app, go to `Edit > Select API URL`.

2. Choose `Local`, `Dev`, `Test`, or `Prod`.
  - Default: `Local` during development using `npm run dev`, `Prod` in executable builds.

<br />

## Test Desktop App Executable

1. **Clear Build Folders**: Remove `desktop/out/` and `desktop/dist/`.

2. **Build Executable**:

  - Run from `desktop/` as an Administrator:

```
npm run build:win
npm run build:mac
npm run build:linux
```

3. **Uninstall Previous Version**: Remove existing installation
    a. Windows: in `C:\Users\<username>\AppData\Local\Programs\desktop`.
    b. Mac: `/Applications/desktop.app`.

4. **Locate Build**: In VSCode, right-click `desktop/dist/` and select `Reveal in Finder/File Explorer`. Run the setup executable.

5. **Test App Launch**: Ensure the desktop app opens correctly, then close it.

6. **Run in Console**:
    a. Windows: Open Command Prompt and run `<file-location>/desktop.exe`
        e.g., `C:\Users\<username>\AppData\Local\Programs\desktop\desktop.exe`
    b. Mac: Open Terminal and run `open <file location>`
        e.g., `open /Applications/desktop.app`

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
