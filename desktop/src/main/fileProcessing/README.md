# IMPORTANT

Workers must be compiled to JavaScript before they can be used. 

Follow these steps every time changes are made to an existing worker, OR a new worker is added.

## Adding a New Worker

1. Add the worker to the `build > extraFiles` in `desktop\package.json`. This will tell the build process to include it in the executable's program files.

2. Rebuild the app using `npm run build`.

3. Restart the development build using `npm run dev`.

<br />

## Updating an Existing Worker

1. Rebuild the app using `npm run build`.

2. Restart the development build using `npm run dev`.