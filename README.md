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
- [Publish Desktop App Updates](#publish-desktop-app-updates)
- [Worker Scripts](#worker-scripts)
- [VPN/BC Gov Network Requirement](#vpnbc-gov-network-requirement)
- [Architecture Diagram](#architecture-diagram)

<br />

## Change API URL

To switch API environments:

1. In the app, go to `Developer > Select Environment`.

2. Choose `Local`, `Dev`, `Test`, or `Prod`.
  - Default: `Local` during development using `npm run dev`, `Prod` in executable builds.

<br />

## Test Desktop App Executable

1. **Clear Build Folders**: Remove `desktop/out/` and `desktop/dist/`.

2. **Build Executable**:

  - Run from `desktop/` as an Administrator:

```
npm run build:windows-latest
npm run build:macos-latest
npm run build:ubuntu-latest
```

3. **Uninstall Previous Version**: Remove existing installation
    - Windows: in `C:\Users\<username>\AppData\Local\Programs\DATS.exe`.
    - Mac: `/Applications/DATS.app`.

4. **Locate Build**: In VSCode, right-click `desktop/dist/` and select `Reveal in Finder/File Explorer`. Run the setup executable.

5. **Test App Launch**: Ensure the desktop app opens correctly, then close it.

6. **Run in Console**:
    a. Windows: Open Command Prompt and run `<file-location>/DATS.exe`
        e.g., `C:\Users\<username>\AppData\Local\Programs\DATS\DATS.exe`
    b. Mac: Open Terminal and run `<file location>`
        e.g., `/Applications/DATS.app/Contents/MacOS/DATS`

<br />

## Publish Desktop App Updates

The desktop app will automatically look for updates every time it is started. It looks at the releases in this repo for newer versions. Details in `desktop/package.json` such as `version` and `build.publish` control the updates.

To create a new release, run the `Build and Publish Electron App` workflow under `Actions` in the repo and choose to update by a patch (y of 'x.x.y'), minor (y of 'x.y.x'), or major (y of 'y.x.x'). The workflow has an error in the last step but it still works.

<br />

## Worker Scripts

The desktop application utilizes worker scripts to collect metadata and copy files from the user's machine. They run on their own threads outside of the main application.

IMPORTANT: Every time changes are made to these workers, the app must be re-built.

The workers are found under `desktop\src\main\fileProcessing\workers`.

The `desktop\src\main\fileProcessing\WorkerPool.ts` controls how the workers are run, handling start up, messaging, and shutdown.

The `desktop\src\main\fileProcessing\actions` are functions that will run the worker scripts. These functions are called by events in the main process.

<br />

## VPN/BC Gov Network Requirement

Use of the application requires a connection to the BC Gov Network (directly or via vpn). 

In the desktop app we check for this every 5 seconds by calling `desktop\src\preload\api\checkIPRange.ts` from a useEffect in `desktop\src\renderer\src\App.tsx`. This checks the users IP list to find one of the allowed ip ranges from a list we got from https://ipinfo.io/AS3633 which gathers ip ranges for `gov.bc.ca`.

In OpenShift we block all requests from outside the ip ranges detailed above.

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
