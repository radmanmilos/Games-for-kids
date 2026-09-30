/* manifest_hash.js — canonical hashing for the offline manifest (dev only).
 *
 * The manifest must describe the bytes GitHub Pages SERVES, and those are the
 * LF form stored in git. Hashing raw work-tree bytes instead made the manifest
 * depend on the machine that built it: on this Windows checkout
 * (core.autocrlf=true) text files are CRLF, so a manifest built here recorded
 * CRLF hashes, while a Linux CI checkout of the same commit has LF bytes and
 * every text file hashed differently — 156 of 206 entries mismatched, and the
 * parent area's «Проверити ажурирања» would report the whole app as changed on
 * a machine that changed nothing.
 *
 * So: text files (anything without a NUL byte) are canonicalised to LF before
 * hashing; binary files are hashed byte-for-byte. Both build_offline.js and
 * validate_offline.js go through this one function, so the builder and the
 * validator can never disagree about what a hash means. */
const crypto = require('crypto');
const fs = require('fs');

function canonicalBytes(buf) {
  if (buf.includes(0)) return buf; /* binary: identity */
  return Buffer.from(buf.toString('utf8').replace(/\r\n/g, '\n'), 'utf8');
}

/** @returns {{sha256:string, size:number}} canonical hash + canonical size */
function hashFile(abs) {
  const b = canonicalBytes(fs.readFileSync(abs));
  return { sha256: crypto.createHash('sha256').update(b).digest('hex'), size: b.length };
}

module.exports = { canonicalBytes, hashFile };
