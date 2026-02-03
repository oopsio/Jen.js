# jDB Example App

This example demonstrates the usage of **jDB**, the embedded JSON database for Jen.js.

## Structure

- `jen.config.ts`: Configures the database type to `jdb`.
- `site/(home).tsx`: Displays users and a form to add new ones.
- `site/api/users.ts`: API endpoint to create users.

## Running

1. Install dependencies (from root):
   ```bash
   pnpm install
   ```

2. Start the example:
   ```bash
   cd example/jdb
   npm start
   ```

3. Visit http://localhost:3000

The database files will be created in `example/jdb/data`.
