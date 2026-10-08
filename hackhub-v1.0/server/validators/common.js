/**
 * Common validation rules and helper utilities for Mongoose schemas
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const URL_REGEX = /^https?:\/\/.+/i;
export const REPO_URL_REGEX = /^https?:\/\/(www\.)?(github\.com|gitlab\.com|bitbucket\.org)\/.+/i;
export const GITHUB_PROFILE_REGEX = /^(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/i;

export const isValidEmail = (email) => {
  return typeof email === 'string' && EMAIL_REGEX.test(email.trim());
};

export const isValidUrl = (url) => {
  if (!url) return true; // Optional URLs
  return typeof url === 'string' && URL_REGEX.test(url.trim());
};

export const isValidRepoUrl = (url) => {
  if (!url) return false;
  return typeof url === 'string' && REPO_URL_REGEX.test(url.trim());
};

export const isValidPercentage = (val) => {
  return typeof val === 'number' && val >= 0 && val <= 100;
};
