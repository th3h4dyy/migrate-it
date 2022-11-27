#!/usr/bin/env node

import fs from "fs/promises";

let MIGRATION_DIR = "";

// get the migration dir path from the command line
const [, , migrationDir] = process.argv;
if (migrationDir) {
  MIGRATION_DIR = migrationDir;
} else {
  console.log("Usage: node index.mjs <path-to-migration-dir>");
  process.exit(1);
}

/**
 * get all migration files
 * @returns {Promise<string[]>}
 */
async function getAllMigrations() {
  try {
    const migrationFiles = await fs.readdir(MIGRATION_DIR);
    return migrationFiles;
  } catch (error) {
    console.error(error);
  }
}

/**
 * sort migration files by name (ascending)
 * @param {string[]} migrationFiles
 * @returns {string[]}
 */

function sortMigrations(migrationFiles) {
  return migrationFiles.sort((a, b) => a.localeCompare(b));
}

/**
 * get the last migration file and increment it by 1 to get the next migration file or return 1 if no migration file exists
 * @returns {Promise<string>}
 * @throws {Error} if no migration directories are found
 * @throws {Error} if the last migration directory is not a number
 */
async function getNextMigration() {
  const migrationFiles = await getAllMigrations();
  if (migrationFiles.length === 0) {
    return "001";
  }
  const sortedMigrations = sortMigrations(migrationFiles);
  const lastMigration = sortedMigrations[sortedMigrations.length - 1];
  const lastMigrationNumber = parseInt(lastMigration.split("-")[0]);
  if (isNaN(lastMigrationNumber)) {
    throw new Error("Last migration is not a number");
  }
  const nextMigrationNumber = lastMigrationNumber + 1;
  return nextMigrationNumber.toString().padStart(3, "0");
}

/**
 * create a new migration directory
 * @param {string} migrationName
 * @returns {Promise<void>}
 * @throws {Error} if the migration directory already exists
 */
async function createMigration(migrationName) {
  const migrationPath = `${MIGRATION_DIR}/${migrationName}`;
  try {
    await fs.mkdir(migrationPath);
  } catch (error) {
    if (error.code === "EEXIST") {
      throw new Error(`Migration ${migrationName} already exists`);
    }
    throw error;
  }
}

/**
 * run the migration script
 * and log the LMS migration directory
 * @returns {Promise<void>}
 */
const main = async () => {
  const nextMigration = await getNextMigration();
  console.log(`LMS: ${nextMigration}`);
  await createMigration(nextMigration);
};

main();
