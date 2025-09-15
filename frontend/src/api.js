export const API_URL = (import.meta.env.VITE_API_URL ?? '').trim()

export async function ping() {
  const resp = await fetch(`${API_URL}/api/health`)
  if (!resp.ok) throw new Error(`status ${resp.status}`)
  return await resp.json()
}
export async function enviarNota({ numero, data, arquivo }) {
  const form = new FormData()
  form.append('numero', numero); form.append('data', data)
  if (arquivo) form.append('arquivo', arquivo)
  const resp = await fetch(`${API_URL}/api/notas`, { method: 'POST', body: form })
  const ct = resp.headers.get('content-type') || ''
  if (!resp.ok) { let msg='Erro ao enviar nota.'; try { const err = ct.includes('application/json')?await resp.json():{}; msg=err.error||msg } catch{}; throw new Error(msg) }
  return ct.includes('application/json') ? await resp.json() : { ok: true }
}
export async function buscarNota(numero) {
  const resp = await fetch(`${API_URL}/api/notas/${encodeURIComponent(numero)}`)
  const ct = resp.headers.get('content-type') || ''
  if (!resp.ok) { let msg='Erro na busca.'; try { const err = ct.includes('application/json')?await resp.json():{}; msg=err.error||msg } catch{}; throw new Error(msg) }
  return ct.includes('application/json') ? await resp.json() : { ok: true }
}
export async function enviarCanhoto({ loja, numero, arquivo }) {
  const form = new FormData()
  form.append('loja', loja); form.append('numero', numero)
  if (arquivo) form.append('arquivo', arquivo)
  const resp = await fetch(`${API_URL}/api/canhotos`, { method: 'POST', body: form })
  const ct = resp.headers.get('content-type') || ''
  if (!resp.ok) { let msg='Erro ao enviar canhoto.'; try { const err = ct.includes('application/json')?await resp.json():{}; msg=err.error||msg } catch{}; throw new Error(msg) }
  return ct.includes('application/json') ? await resp.json() : { ok: true }
}
export async function buscarCanhoto({ loja, numero }) {
  const url = `${API_URL}/api/canhotos?loja=${encodeURIComponent(loja)}&numero=${encodeURIComponent(numero)}`
  const resp = await fetch(url)
  const ct = resp.headers.get('content-type') || ''
  if (!resp.ok) { let msg='Erro na busca de canhoto.'; try { const err = ct.includes('application/json')?await resp.json():{}; msg=err.error||msg } catch{}; throw new Error(msg) }
  return ct.includes('application/json') ? await resp.json() : { ok: true }
}
