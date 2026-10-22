/* lib/imagefile.js — tell what an image file really is, and turn a JPEG into a PNG.
 *
 * Why this exists: the Workers AI image endpoint returns JPEG bytes no matter what
 * the output file is called, and a file whose name lies about its content is worse
 * than no file at all (it passes as a PNG until something decodes it). Every file
 * that enters the asset bundle therefore gets sniffed from its magic bytes first.
 *
 * Conversion path: on Windows the built-in System.Drawing assembly decodes JPEG and
 * writes PNG without any extra dependency. Elsewhere there is no decoder in Node's
 * standard library, so the caller keeps the original bytes under their true
 * extension instead of writing a mislabelled file.
 *
 * Usage: node tools/lib/imagefile.js <file>   # prints the detected format
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const SIGNATURES = [
  { format: 'png', extension: '.png', bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { format: 'jpeg', extension: '.jpg', bytes: [0xff, 0xd8, 0xff] },
  { format: 'gif', extension: '.gif', bytes: [0x47, 0x49, 0x46, 0x38] },
];

/** Identify an image from its magic bytes. Never trusts the file name. */
function detectFormat(bytes) {
  if (!bytes || bytes.length < 4) return { format: 'unknown', extension: '.bin' };
  for (const signature of SIGNATURES) {
    if (bytes.length >= signature.bytes.length
      && signature.bytes.every((byte, index) => bytes[index] === byte)) {
      return { format: signature.format, extension: signature.extension };
    }
  }
  // RIFF container: WebP when the form type says so.
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF'
    && bytes.toString('ascii', 8, 12) === 'WEBP') {
    return { format: 'webp', extension: '.webp' };
  }
  return { format: 'unknown', extension: '.bin' };
}

const POWERSHELL_SCRIPT = [
  'param([string]$In, [string]$Out)',
  'Add-Type -AssemblyName System.Drawing',
  '$img = [System.Drawing.Image]::FromFile($In)',
  'try { $img.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png) } finally { $img.Dispose() }',
].join('\n');

/**
 * Convert an image to PNG. Returns { png, converted, reason }.
 * `converted` is false (and `png` is null) when no decoder is available; the caller
 * then keeps the original bytes under their true extension.
 */
function convertToPng(bytes) {
  const { format } = detectFormat(bytes);
  if (format === 'png') return { png: bytes, converted: false, reason: 'already PNG' };
  if (format !== 'jpeg') return { png: null, converted: false, reason: `no decoder for ${format}` };
  if (process.platform !== 'win32') {
    return { png: null, converted: false, reason: 'JPEG decoding needs the Windows System.Drawing assembly' };
  }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'img-convert-'));
  const input = path.join(dir, 'input.jpg');
  const output = path.join(dir, 'output.png');
  const script = path.join(dir, 'to-png.ps1');
  try {
    fs.writeFileSync(input, bytes);
    fs.writeFileSync(script, POWERSHELL_SCRIPT);
    const result = spawnSync('powershell', [
      '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
      '-File', script, '-In', input, '-Out', output,
    ], { encoding: 'utf8' });
    if (result.status !== 0 || !fs.existsSync(output)) {
      const detail = (result.stderr || result.stdout || '').trim().split('\n').slice(-1)[0] || 'conversion failed';
      return { png: null, converted: false, reason: `JPEG->PNG conversion failed: ${detail}` };
    }
    const png = fs.readFileSync(output);
    if (detectFormat(png).format !== 'png') {
      return { png: null, converted: false, reason: 'JPEG->PNG conversion produced a file that is not a PNG' };
    }
    return { png, converted: true, reason: 'converted with System.Drawing' };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

module.exports = { detectFormat, convertToPng };

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node tools/lib/imagefile.js <file>');
    process.exit(2);
  }
  const bytes = fs.readFileSync(path.resolve(file));
  const detected = detectFormat(bytes);
  console.log(`${file}: ${detected.format} (${detected.extension}), ${bytes.length} bytes`);
}
