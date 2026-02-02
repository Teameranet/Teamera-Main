/**
 * Database Connection Configuration
 * Infrastructure Layer - Database Configuration
 *
 * This module handles MongoDB database connection management.
 * It provides connection initialization, status monitoring, and graceful shutdown.
 *
 * Clean Architecture: Infrastructure Layer
 * - Handles external concerns (database)
 * - Implements technical details
 * - Can be swapped without affecting domain/application layers
 */

import mongoose from "mongoose";

/**
 * Database connection configuration options
 */
const defaultOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4
  retryWrites: true,
  retryReads: true,
};

/**
 * Connection state tracking (renamed to avoid conflict with class method)
 */
let _connectionState = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_DELAY_MS = 5000;

/**
 * Database connection class
 */
class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.uri = null;
  }

  /**
   * Get the MongoDB connection URI from environment variables
   * @returns {string} MongoDB connection URI
   */
  getConnectionUri() {
    const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;

    if (!uri) {
      // Default to local MongoDB for development
      const dbName = process.env.DB_NAME || "teamera";
      const host = process.env.DB_HOST || "localhost";
      const port = process.env.DB_PORT || "27017";
      return `mongodb://${host}:${port}/${dbName}`;
    }

    return uri;
  }

  /**
   * Connect to MongoDB database
   * @param {object} options - Connection options
   * @returns {Promise<mongoose.Connection>}
   */
  async connect(options = {}) {
    if (_connectionState && this.connection) {
      console.log("📦 Using existing database connection");
      return this.connection;
    }

    this.uri = this.getConnectionUri();
    const connectionOptions = { ...defaultOptions, ...options };

    try {
      console.log("🔄 Connecting to MongoDB...");

      // Set up connection event handlers
      this.setupEventHandlers();

      // Connect to MongoDB
      await mongoose.connect(this.uri, connectionOptions);

      this.connection = mongoose.connection;
      _connectionState = true;
      connectionAttempts = 0;

      console.log("✅ MongoDB connected successfully");
      console.log(`📍 Database: ${this.getDatabaseName()}`);

      return this.connection;
    } catch (error) {
      console.error("❌ MongoDB connection error:", error.message);
      return this.handleConnectionError(error, options);
    }
  }

  /**
   * Set up mongoose connection event handlers
   */
  setupEventHandlers() {
    mongoose.connection.on("connected", () => {
      console.log("📗 Mongoose connected to database");
      _connectionState = true;
    });

    mongoose.connection.on("error", (err) => {
      console.error("📕 Mongoose connection error:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("📙 Mongoose disconnected from database");
      _connectionState = false;
    });

    mongoose.connection.on("reconnected", () => {
      console.log("📘 Mongoose reconnected to database");
      _connectionState = true;
    });

    // Handle process termination
    process.on("SIGINT", this.gracefulShutdown.bind(this, "SIGINT"));
    process.on("SIGTERM", this.gracefulShutdown.bind(this, "SIGTERM"));
  }

  /**
   * Handle connection errors with retry logic
   * @param {Error} error - Connection error
   * @param {object} options - Connection options
   * @returns {Promise<mongoose.Connection>}
   */
  async handleConnectionError(error, options) {
    connectionAttempts++;

    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(
        `🔄 Retrying connection (${connectionAttempts}/${MAX_RETRY_ATTEMPTS}) in ${RETRY_DELAY_MS / 1000}s...`,
      );

      await this.delay(RETRY_DELAY_MS);
      return this.connect(options);
    }

    console.error(`❌ Failed to connect after ${MAX_RETRY_ATTEMPTS} attempts`);
    throw error;
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (!_connectionState) {
      console.log("📦 No active database connection to close");
      return;
    }

    try {
      await mongoose.disconnect();
      _connectionState = false;
      this.connection = null;
      console.log("✅ MongoDB disconnected successfully");
    } catch (error) {
      console.error("❌ Error disconnecting from MongoDB:", error.message);
      throw error;
    }
  }

  /**
   * Graceful shutdown handler
   * @param {string} signal - Process signal
   */
  async gracefulShutdown(signal) {
    console.log(`\n⚠️  Received ${signal}. Closing database connection...`);

    try {
      await this.disconnect();
      console.log("👋 Database connection closed. Exiting process.");
      process.exit(0);
    } catch (error) {
      console.error("❌ Error during graceful shutdown:", error.message);
      process.exit(1);
    }
  }

  /**
   * Check if database is connected
   * @returns {boolean}
   */
  isConnected() {
    return _connectionState && mongoose.connection.readyState === 1;
  }

  /**
   * Get connection status details
   * @returns {object}
   */
  getStatus() {
    const states = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    return {
      isConnected: this.isConnected(),
      state: states[mongoose.connection.readyState] || "unknown",
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      name: this.getDatabaseName(),
    };
  }

  /**
   * Get the database name
   * @returns {string}
   */
  getDatabaseName() {
    if (mongoose.connection && mongoose.connection.name) {
      return mongoose.connection.name;
    }
    return process.env.DB_NAME || "teamera";
  }

  /**
   * Ping the database to check connectivity
   * @returns {Promise<boolean>}
   */
  async ping() {
    try {
      if (!this.isConnected()) {
        return false;
      }

      await mongoose.connection.db.admin().ping();
      return true;
    } catch (error) {
      console.error("❌ Database ping failed:", error.message);
      return false;
    }
  }

  /**
   * Get the mongoose connection instance
   * @returns {mongoose.Connection}
   */
  getConnection() {
    return mongoose.connection;
  }

  /**
   * Get the mongoose instance
   * @returns {mongoose}
   */
  getMongoose() {
    return mongoose;
  }

  /**
   * Delay helper for retry logic
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Drop the database (use with caution - mainly for testing)
   * @returns {Promise<void>}
   */
  async dropDatabase() {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Cannot drop database in production environment");
    }

    if (!this.isConnected()) {
      throw new Error("No active database connection");
    }

    console.log("⚠️  Dropping database...");
    await mongoose.connection.dropDatabase();
    console.log("✅ Database dropped successfully");
  }
}

// Create singleton instance
const databaseConnection = new DatabaseConnection();

// Export connection methods
export const connect = (options) => databaseConnection.connect(options);
export const disconnect = () => databaseConnection.disconnect();
export const getStatus = () => databaseConnection.getStatus();
export const checkConnection = () => databaseConnection.isConnected();
export const ping = () => databaseConnection.ping();
export const getConnection = () => databaseConnection.getConnection();
export const getMongoose = () => databaseConnection.getMongoose();

export { databaseConnection };
export default databaseConnection;
