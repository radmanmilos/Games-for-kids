/* asset_generate.js — generate one candidate illustration through Cloudflare Workers AI.
 *
 * The image API is used as a free-tier service (10,000 neurons per day, no credit
 * card): the model is called with the approved references as input images so the new
 * candidate lands in the same painted family as the ones already accepted, instead of
 * a generic "watercolour" guess.
 *
 * Credentials never touch the repository. They are read from the environment
 * (CF_ACCOUNT_ID / CF_API_TOKEN) or from a JSON file outside the repo passed with
 * --creds. The script refuses to run without them and never writes them anywhere.
 *
 * Usage:
 *   node tools/asset_generate.js --prompt <brief.md> --out <file.png> [--refs 2] [--dry-run]
 */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { buildPool, pickReferences, pickByName } = require('./asset_refpool.js');
const { inspect } = require('./asset_qa.js');
const { detectFormat, convertToPng } = require('./lib/imagefile.js');
const { decodePng } = require('./lib/png.js');

const ROOT = path.resolve(__dirname, '..');
const API_ROOT = 'https://api.cloudflare.com/client/v4/accounts';
const DEFAULT_MODEL = '@cf/black-forest-labs/flux-2-klein-4b';

/**
 * Neuron rates per 512x512 tile, from the Workers AI pricing page (checked
 * 2026-10-22). Workers AI bills in neurons; the free allowance is 10,000 per day
 * and it resets at 00:00 UTC. The dashboard shows the account total, so the
 * per-run cost is also tracked locally (tools/.cache/asset-usage.json).
 */
const NEURON_RATES = {
  '@cf/black-forest-labs/flux-2-klein-4b': { inputTile: 5.37, outputTile: 26.05 },
};
const DAILY_FREE_NEURONS = 10000;

function parseArgs(argv) {
  const args = argv.slice(2);
  const options = {
    prompt: null, out: null, model: DEFAULT_MODEL, refs: 2, width: 1024, height: 1024,
    steps: 8, seed: null, creds: null, dryRun: false, refFiles: null,
  };
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--prompt') options.prompt = args[++i];
    else if (arg === '--out') options.out = args[++i];
    else if (arg === '--model') options.model = args[++i];
    else if (arg === '--refs') options.refs = Number(args[++i]);
    else if (arg === '--ref-files') options.refFiles = args[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (arg === '--width') options.width = Number(args[++i]);
    else if (arg === '--height') options.height = Number(args[++i]);
    else if (arg === '--steps') options.steps = Number(args[++i]);
    else if (arg === '--seed') options.seed = Number(args[++i]);
    else if (arg === '--creds') options.creds = args[++i];
    else if (arg === '--dry-run') options.dryRun = true;
    else throw new Error(`Unknown argument ${arg}`);
  }
  if (!options.prompt) throw new Error('--prompt <brief.md> is required');
  return options;
}

/**
 * Credentials are read from the environment (CF_ACCOUNT_ID / CF_API_TOKEN), from a
 * JSON file passed with --creds, or from the default drop-in file below. Nothing is
 * ever written into the repository.
 */
function loadCredentials(options) {
  let accountId = process.env.CF_ACCOUNT_ID;
  let apiToken = process.env.CF_API_TOKEN;
  const candidates = [];
  if (options.creds) candidates.push(path.resolve(options.creds));
  candidates.push(path.join(os.tmpdir(), 'opencode', 'cloudflare-creds.json'));
  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    // Strip a UTF-8 BOM: PowerShell writes one by default.
    const text = fs.readFileSync(candidate, 'utf8').replace(/^\uFEFF/, '');
    let file;
    try {
      file = JSON.parse(text);
    } catch (error) {
      throw new Error(`Could not parse the credentials file ${candidate}: ${error.message}`);
    }
    accountId = accountId || file.accountId;
    apiToken = apiToken || file.apiToken;
  }
  if (!accountId || !apiToken) {
    throw new Error(
      'Missing Cloudflare credentials. Set CF_ACCOUNT_ID and CF_API_TOKEN, pass --creds <file.json>, '
      + `or drop {"accountId":"...","apiToken":"..."} into ${path.join(os.tmpdir(), 'opencode', 'cloudflare-creds.json')}.`
    );
  }
  return { accountId, apiToken };
}

/**
 * A brief file may carry notes above the prompt (asset id, use sites, canvas rules).
 * Only the text after the last "--- prompt ---" marker is sent to the model; without
 * the marker the whole file is used.
 */
function extractPrompt(file) {
  const text = fs.readFileSync(path.resolve(file), 'utf8');
  const marker = '--- prompt ---';
  const at = text.lastIndexOf(marker);
  return at === -1 ? text : text.slice(at + marker.length);
}

/** Explain to the model which input image is which, then append the brief from file. */
function composePrompt(brief, references) {
  const roles = references.map((entry, index) => `image ${index} = ${entry.name}`);
  const routing = references.length === 1
    ? `Match the art style, brushwork, palette and level of detail of ${roles[0]}.`
    : `Match the art style, brushwork, palette and level of detail of ${roles[0]} and ${roles[1]}.`
      + (references.length > 2
        ? ` ${roles.slice(2).join(' and ')} show further members of the same approved family: keep their finish and detail level, but do not copy their shapes or features.`
        : '');
  return `${routing}\n\n${brief.trim()}`;
}

async function generate(options, references, brief) {
  const { accountId, apiToken } = loadCredentials(options);
  const form = new FormData();
  form.append('prompt', composePrompt(brief, references));
  form.append('width', String(options.width));
  form.append('height', String(options.height));
  form.append('steps', String(options.steps));
  if (options.seed !== null) form.append('seed', String(options.seed));
  references.forEach((entry, index) => {
    const blob = new Blob([fs.readFileSync(entry.apiFile)], { type: 'image/png' });
    form.append(`input_image_${index}`, blob, path.basename(entry.apiFile));
  });

  const url = `${API_ROOT}/${accountId}/ai/run/${options.model}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiToken}` },
    body: form,
  });
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Cloudflare API ${response.status}: ${detail.slice(0, 800)}`);
  }
  if (contentType.includes('application/json')) {
    const payload = await response.json();
    if (payload && payload.success === false) {
      throw new Error(`Cloudflare API error: ${JSON.stringify(payload.errors || payload).slice(0, 800)}`);
    }
    const image = payload && payload.result && payload.result.image;
    if (!image) throw new Error(`Cloudflare API returned no image: ${JSON.stringify(payload).slice(0, 400)}`);
    return Buffer.from(image, 'base64');
  }
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Estimate what one run costs in neurons and keep a local log of it, so the usage
 * is visible per candidate and not only as a daily total on the Cloudflare
 * dashboard (dash.cloudflare.com -> AI -> Workers AI).
 */
function tileCount(width, height) {
  return Math.ceil(width / 512) * Math.ceil(height / 512);
}

function estimateNeurons(model, references, options) {
  const rate = NEURON_RATES[model];
  if (!rate) return null;
  let inputTiles = 0;
  for (const entry of references) {
    const image = decodePng(fs.readFileSync(entry.apiFile));
    inputTiles += tileCount(image.width, image.height);
  }
  const outputTiles = tileCount(options.width, options.height);
  const input = inputTiles * rate.inputTile;
  const output = outputTiles * rate.outputTile;
  return { inputTiles, outputTiles, input, output, total: input + output };
}

/** Append the run to the local usage log and report the day's running total. */
function recordUsage(entry) {
  const dir = path.join(ROOT, 'tools', '.cache');
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'asset-usage.json');
  let rows = [];
  if (fs.existsSync(file)) {
    try { rows = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (error) { rows = []; }
  }
  rows.push(entry);
  fs.writeFileSync(file, JSON.stringify(rows, null, 2) + '\n');
  const today = rows.filter((row) => row.day === entry.day);
  const total = today.reduce((sum, row) => sum + row.neurons, 0);
  return { runs: today.length, total };
}

async function main() {
  const options = parseArgs(process.argv);
  const brief = extractPrompt(options.prompt);
  const pool = buildPool();
  const references = options.refFiles
    ? pickByName(pool, options.refFiles)
    : pickReferences(pool, Math.max(1, Math.min(4, options.refs)));
  if (!references.length) throw new Error('No reference images selected');
  const prompt = composePrompt(brief, references);

  console.log('--- references sent ---');
  references.forEach((entry, index) => console.log(`  input_image_${index}: ${entry.name} (${entry.role}${entry.family ? '/' + entry.family : ''}, ${entry.width}x${entry.height}) <- ${path.basename(entry.apiFile)}`));
  console.log('--- prompt ---');
  console.log(prompt);
  console.log('---');

  if (options.dryRun) {
    console.log('dry run: no request sent.');
    return;
  }
  if (!options.out) throw new Error('--out <file.png> is required unless --dry-run is used');

  const raw = await generate(options, references, brief);
  const detected = detectFormat(raw);
  // The endpoint answers with JPEG whatever the output name says, so the file is
  // converted to PNG (the bundle convention) or kept under its true extension.
  const conversion = convertToPng(raw);
  const bytes = conversion.png || raw;
  let out = path.resolve(options.out);
  if (!conversion.png && detected.format !== 'png') {
    out = out.replace(/\.[a-z0-9]+$/i, detected.extension);
  }
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, bytes);
  console.log(`saved ${path.relative(ROOT, out).replace(/\\/g, '/')} (${bytes.length} bytes)`);
  console.log(`source format: ${detected.format}${conversion.converted ? ' -> converted to PNG (' + conversion.reason + ')' : ''}`);
  if (detected.format !== 'png' && !conversion.png) {
    console.log(`WARNING: no PNG decoder on this platform, so the file keeps its true ${detected.format} extension.`);
  }
  const record = inspect(out, pool.bearPalette);
  console.log(`QA: ${record.width}x${record.height} ${record.colorType} | alpha opaque/transparent/partial ${record.alphaOpaquePct}/${record.alphaTransparentPct}/${record.alphaPartialPct}% | corner alpha ${record.cornerAlpha.join(',')} | palette ${record.paletteMean.join('/')} | palette-match vs bear ${record.paletteMatch}`);

  const estimate = estimateNeurons(options.model, references, options);
  if (!estimate) {
    console.log(`neurons: no local rate for ${options.model} - check the Workers AI pricing page`);
    return;
  }
  const usage = recordUsage({
    day: new Date().toISOString().slice(0, 10),
    ts: new Date().toISOString(),
    model: options.model,
    out: path.relative(ROOT, out).replace(/\\/g, '/'),
    refs: references.map((entry) => entry.name),
    neurons: Math.round(estimate.total * 100) / 100,
  });
  console.log(
    `neurons: ~${estimate.total.toFixed(1)} `
    + `(${estimate.inputTiles} input tile(s) x 5.37 + ${estimate.outputTiles} output tile(s) x 26.05)`
    + ` | today: ${usage.runs} run(s), ~${usage.total.toFixed(1)} of the ${DAILY_FREE_NEURONS} free neurons`
  );
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`asset_generate failed: ${error.message}`);
    process.exit(1);
  });
}
module.exports = { composePrompt, estimateNeurons, tileCount };
