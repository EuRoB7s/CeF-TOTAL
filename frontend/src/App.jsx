import React, { useState } from 'react'
import { ping, enviarNota, buscarNota, enviarCanhoto, buscarCanhoto } from './api'
import HighlightedImage from './components/HighlightedImage'

export default function App() {
  const [statusPing, setStatusPing] = useState('')

  const [numeroEnvio, setNumeroEnvio] = useState('')
  const [dataEnvio, setDataEnvio] = useState('')
  const [arquivoNota, setArquivoNota] = useState(null)
  const [statusEnvio, setStatusEnvio] = useState('')
  const [numeroBusca, setNumeroBusca] = useState('')
  const [resultadoBusca, setResultadoBusca] = useState(null)
  const [statusBusca, setStatusBusca] = useState('')

  const [lojaEnvio, setLojaEnvio] = useState('')
  const [numeroCanhotoEnvio, setNumeroCanhotoEnvio] = useState('')
  const [arquivoCanhoto, setArquivoCanhoto] = useState(null)
  const [statusEnvioCanhoto, setStatusEnvioCanhoto] = useState('')

  const [lojaBusca, setLojaBusca] = useState('')
  const [numeroCanhotoBusca, setNumeroCanhotoBusca] = useState('')
  const [resultadoCanhoto, setResultadoCanhoto] = useState(null)
  const [statusBuscaCanhoto, setStatusBuscaCanhoto] = useState('')

  async function handlePing() {
    setStatusPing('Testando...')
    try { const r = await ping(); setStatusPing(`✅ OK – ${r.ts}`) } catch (e) { setStatusPing(`❌ ${e.message}`) }
  }

  async function handleEnviarNota(e) {
    e.preventDefault(); setStatusEnvio('Enviando...')
    try {
      await enviarNota({ numero: numeroEnvio, data: dataEnvio, arquivo: arquivoNota })
      setStatusEnvio('✅ Nota enviada'); setNumeroEnvio(''); setDataEnvio(''); setArquivoNota(null)
    } catch (e) { setStatusEnvio(`❌ ${e.message}`) }
  }
  async function handleBuscarNota(e) {
    e.preventDefault(); setStatusBusca('Buscando...'); setResultadoBusca(null)
    try { const r = await buscarNota(numeroBusca); setResultadoBusca(r.nota); setStatusBusca('✅ Encontrado!') }
    catch (e) { setStatusBusca(`❌ ${e.message}`) }
  }

  async function handleEnviarCanhoto(e) {
    e.preventDefault(); setStatusEnvioCanhoto('Enviando...')
    try {
      await enviarCanhoto({ loja: lojaEnvio, numero: numeroCanhotoEnvio, arquivo: arquivoCanhoto })
      setStatusEnvioCanhoto('✅ Canhoto enviado'); setLojaEnvio(''); setNumeroCanhotoEnvio(''); setArquivoCanhoto(null)
    } catch (e) { setStatusEnvioCanhoto(`❌ ${e.message}`) }
  }
  async function handleBuscarCanhoto(e) {
    e.preventDefault(); setStatusBuscaCanhoto('Buscando...'); setResultadoCanhoto(null)
    try {
      const r = await buscarCanhoto({ loja: lojaBusca, numero: numeroCanhotoBusca })
      setResultadoCanhoto(r.ultimo); setStatusBuscaCanhoto('✅ Encontrado!')
    } catch (e) { setStatusBuscaCanhoto(`❌ ${e.message}`) }
  }

  return (
    <>
      <div className="overlay" />
      <header className="header">
        <img className="logo" src="/logo-cf-ceasa.svg" alt="C&F" />
        <div className="title">C&F Ceasa – NFS Keepers</div>
      </header>
      <div className="subtitle">Enviar/Buscar Notas e Canhotos — com destaque do número pesquisado no canhoto</div>

      <main className="container">
        <section className="card">
          <h2>Conexão</h2>
          <button className="button" onClick={handlePing}>Testar conexão</button>
          <div className={`status ${statusPing.startsWith('✅') ? 'ok' : statusPing.startsWith('❌') ? 'err' : ''}`}>{statusPing}</div>
        </section>

        <section className="card">
          <h2>Enviar Nota</h2>
          <form onSubmit={handleEnviarNota}>
            <div className="form-row">
              <div>
                <label>Número da Nota</label>
                <input type="text" value={numeroEnvio} onChange={e=>setNumeroEnvio(e.target.value)} required />
              </div>
              <div>
                <label>Data</label>
                <input type="date" value={dataEnvio} onChange={e=>setDataEnvio(e.target.value)} required />
              </div>
            </div>
            <div style={{marginTop:10}}>
              <label>Arquivo (PDF recomendado)</label>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={e=>setArquivoNota(e.target.files?.[0]||null)} required />
            </div>
            <button className="button" type="submit">Enviar</button>
          </form>
          <div className={`status ${statusEnvio.startsWith('✅') ? 'ok' : statusEnvio.startsWith('❌') ? 'err' : ''}`}>{statusEnvio}</div>
        </section>

        <section className="card">
          <h2>Buscar Nota</h2>
          <form onSubmit={handleBuscarNota}>
            <label>Número da Nota</label>
            <input type="text" value={numeroBusca} onChange={e=>setNumeroBusca(e.target.value)} required />
            <button className="button" type="submit">Buscar</button>
          </form>
          <div className={`status ${statusBusca.startsWith('✅') ? 'ok' : statusBusca.startsWith('❌') ? 'err' : ''}`}>{statusBusca}</div>
          {resultadoBusca && (
            <div className="result">
              <div><b>Número:</b> {resultadoBusca.numero}</div>
              <div><b>Data:</b> {resultadoBusca.data}</div>
              <div><b>Arquivo:</b> <a className="link" href={resultadoBusca.url || resultadoBusca.path} target="_blank" rel="noreferrer">Abrir / Download</a></div>
              <div><b>Enviado em:</b> {new Date(resultadoBusca.uploadedAt).toLocaleString()}</div>
            </div>
          )}
        </section>

        <section className="card">
          <h2>Enviar Canhoto (imagem)</h2>
          <form onSubmit={handleEnviarCanhoto}>
            <div className="form-row">
              <div>
                <label>Loja</label>
                <input type="text" value={lojaEnvio} onChange={e=>setLojaEnvio(e.target.value)} placeholder="Ex.: 5" required />
              </div>
              <div>
                <label>Número do Canhoto</label>
                <input type="text" value={numeroCanhotoEnvio} onChange={e=>setNumeroCanhotoEnvio(e.target.value)} placeholder="Ex.: 117540" required />
              </div>
            </div>
            <div style={{marginTop:10}}>
              <label>Foto do Canhoto (JPG/PNG)</label>
              <input type="file" accept=".png,.jpg,.jpeg" onChange={e=>setArquivoCanhoto(e.target.files?.[0]||null)} required />
            </div>
            <button className="button" type="submit">Enviar</button>
          </form>
          <div className={`status ${statusEnvioCanhoto.startsWith('✅') ? 'ok' : statusEnvioCanhoto.startsWith('❌') ? 'err' : ''}`}>{statusEnvioCanhoto}</div>
          <div className="note">Dica: pode enviar foto com vários canhotos na mesma imagem.</div>
        </section>

        <section className="card">
          <h2>Buscar Canhoto (destacar número)</h2>
          <form onSubmit={handleBuscarCanhoto}>
            <div className="form-row">
              <div>
                <label>Loja</label>
                <input type="text" value={lojaBusca} onChange={e=>setLojaBusca(e.target.value)} placeholder="Ex.: 5" required />
              </div>
              <div>
                <label>Número do Canhoto</label>
                <input type="text" value={numeroCanhotoBusca} onChange={e=>setNumeroCanhotoBusca(e.target.value)} placeholder="Ex.: 117540" required />
              </div>
            </div>
            <button className="button" type="submit">Buscar</button>
          </form>
          <div className={`status ${statusBuscaCanhoto.startsWith('✅') ? 'ok' : statusBuscaCanhoto.startsWith('❌') ? 'err' : ''}`}>{statusBuscaCanhoto}</div>

          {resultadoCanhoto && (
            <div className="result">
              <div><b>Loja:</b> {resultadoCanhoto.loja}</div>
              <div><b>Canhoto:</b> {resultadoCanhoto.numero}</div>
              <div style={{marginTop:10}}>
                <HighlightedImage src={resultadoCanhoto.url || resultadoCanhoto.path} numeroAlvo={numeroCanhotoBusca} cor="#22c55e" />
              </div>
              <div style={{marginTop:8}}><a className="link" href={resultadoCanhoto.url || resultadoCanhoto.path} target="_blank" rel="noreferrer">Abrir imagem original</a></div>
            </div>
          )}
        </section>
      </main>
    </>
  )
}
