// Vercel "Ignored Build Step": solo se construye/despliega si el workflow CI de GitHub
// terminó en éxito para este commit. Exit 1 = construir, exit 0 = omitir.
const owner = process.env.VERCEL_GIT_REPO_OWNER
const repo = process.env.VERCEL_GIT_REPO_SLUG
const sha = process.env.VERCEL_GIT_COMMIT_SHA
if (!owner || !repo || !sha) {
  console.log('Sin datos de Git (build manual): se construye.')
  process.exit(1)
}
const url = `https://api.github.com/repos/${owner}/${repo}/commits/${sha}/check-runs?per_page=50`
const wait = ms => new Promise(r => setTimeout(r, ms))
const deadline = Date.now() + 12 * 60 * 1000
while (Date.now() < deadline) {
  try {
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'vercel-ci-gate' } })
    if (res.ok) {
      const { check_runs = [] } = await res.json()
      const jobs = check_runs.filter(c => c.app?.slug === 'github-actions')
      if (jobs.length && jobs.every(c => c.status === 'completed')) {
        const ok = jobs.every(c => ['success', 'skipped', 'neutral'].includes(c.conclusion))
        console.log(ok ? 'CI en verde: se despliega.' : 'CI falló: se omite el deploy.')
        process.exit(ok ? 1 : 0)
      }
      console.log(`Esperando CI... (${jobs.length} jobs)`)
    } else console.log('GitHub API:', res.status)
  } catch (e) { console.log('Error consultando CI:', e.message) }
  await wait(15000)
}
console.log('CI no terminó a tiempo: se omite el deploy.')
process.exit(0)
