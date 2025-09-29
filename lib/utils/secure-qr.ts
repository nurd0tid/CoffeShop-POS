"use server";

import crypto from "node:crypto";

// ===== Base64URL helpers =====
function b64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function deb64url(s: string): Buffer {
  const pad = s.length % 4 ? 4 - (s.length % 4) : 0;
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad), "base64");
}

// ===== Key derivation (PBKDF2) dengan SHA-256 → 32 byte (AES-256) =====
function deriveKey(passphrase: string, salt: Buffer) {
  return crypto.pbkdf2Sync(passphrase, salt, 120_000, 32, "sha256");
}

function getSecret() {
  const secret = process.env.QR_SECRET_PASSPHRASE;
  if (!secret) throw new Error("QR_SECRET_PASSPHRASE belum diset di .env.local");
  return secret;
}

/**
 * Enkripsi payload → token base64url compact:
 * v1.<salt>.<iv>.<ciphertext>.<tag>
 */
export async function encryptPayload(obj: unknown): Promise<string> {
  const secret = getSecret();
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = deriveKey(secret, salt);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return ["v1", b64url(salt), b64url(iv), b64url(ciphertext), b64url(tag)].join(".");
}

/**
 * Dekripsi token → payload object
 * Throw kalau token diubah/korup (integritas gagal)
 */
export async function decryptPayload<T = unknown>(token: string): Promise<T> {
  const parts = token.split(".");
  if (parts.length !== 5 || parts[0] !== "v1") throw new Error("Invalid token format");

  const [, saltB64, ivB64, ctB64, tagB64] = parts;
  const salt = deb64url(saltB64);
  const iv = deb64url(ivB64);
  const ct = deb64url(ctB64);
  const tag = deb64url(tagB64);

  const key = deriveKey(getSecret(), salt);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}
