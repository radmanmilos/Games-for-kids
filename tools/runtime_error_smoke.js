/* Runtime-error gate smoke: inspect every registered page, then negative-test
   the exception, console, rejection, and local-resource capture paths. */
const { start, check, getFails } = require('./headless.js');
const { all: registryAll } = require('./registry.js');

(async () => {
  const h = await start({ page: '/index.html', tag: 'runtime-error-smoke', width: 1280, height: 800 });
  try {
    const pages = ['/index.html', ...registryAll().map(app => app.url)];
    for (const page of pages) {
      await h.navigate(`http://127.0.0.1:${h.port}${page}`);
      const ready = await h.waitFor(`document.readyState === 'complete'`,
        { timeout: 8000, label: `${page} to finish loading` });
      check(`${page} loads for runtime scan`, ready.ok, ready.why || 'complete');
      await h.sleep(300);
    }

    const clean = await h.checkRuntimeErrors();
    check('all registered pages load without runtime errors', clean,
      `${pages.length} pages scanned`);

    await h.evalv(`(() => {
      console.error('R8 capture probe: console.error');
      setTimeout(() => { throw new Error('R8 capture probe: uncaught exception'); }, 0);
      setTimeout(() => Promise.reject(new Error('R8 capture probe: unhandled rejection')), 0);
      const script = document.createElement('script');
      script.src = '/missing-r8-probe.js';
      document.head.appendChild(script);
      return true;
    })()`);

    const deadline = Date.now() + 5000;
    let errors = h.getRuntimeErrors();
    while (Date.now() < deadline
      && !['exception', 'console.error', 'unhandledrejection', 'resource'].every(
        kind => errors.some(error => error.kind === kind))) {
      await h.sleep(50);
      errors = h.getRuntimeErrors();
    }
    for (const kind of ['exception', 'console.error', 'unhandledrejection', 'resource']) {
      check(`runtime capture detects ${kind}`, errors.some(error => error.kind === kind),
        errors.find(error => error.kind === kind)?.detail || 'no matching event captured');
    }
  } finally {
    await h.close({ checkErrors: false });
  }

  const fails = getFails();
  console.log(`\n${fails === 0 ? 'ALL' : 'SOME'} RUNTIME ERROR CHECKS ${fails === 0 ? 'PASSED' : 'FAILED'} (${fails} fail)`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('runtime_error_smoke crashed:', e); process.exit(1); });
