/**
 * Custom entry point for the app
 *
 * IMPORTANT: This file imports the Unistyles config BEFORE expo-router
 * to ensure StyleSheet.configure() runs before any StyleSheet.create() calls.
 */

// Must be first - configure Unistyles theme before any styled components load
import './unistyles.config';

// Now load expo-router which will load all route files
import 'expo-router/entry';
