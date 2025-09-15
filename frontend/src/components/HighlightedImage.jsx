import React, { useEffect, useRef, useState } from 'react'
import Tesseract from 'tesseract.js'

function normDigits(s) { return (s||'').replace(/\D+/g,'') }

function findMatches(words, targetDigits) {
  const results = []
  for (let i=0;i<words.length;i++) {
    const w = words[i]
    const d = normDigits(w.text)
    if (d && (d === targetDigits || d.includes(targetDigits) || targetDigits.includes(d))) {
      results.push([w])
      continue
    }
    let acc = '', group = []
    for (let j=i;j<Math.min(i+6, words.length);j++) {
      const wj = words[j]
      const dj = normDigits(wj.text)
      if (!dj) break
      acc += dj; group.push(wj)
      if (acc === targetDigits || acc.includes(targetDigits) || targetDigits.includes(acc)) {
        results.push(group.slice()); break
      }
      if (acc.length > targetDigits.length + 2) break
    }
  }
  const uniq = []
  for (const g of results) {
    const box = unionBox(g.map(x => x.bbox))
    if (!uniq.some(u => overlap(u, box) > 0.6)) uniq.push(box)
  }
  return uniq
}

function unionBox(boxes) {
  const x0 = Math.min(...boxes.map(b => b.x0))
  const y0 = Math.min(...boxes.map(b => b.y0))
  const x1 = Math.max(...boxes.map(b => b.x1))
  const y1 = Math.max(...boxes.map(b => b.y1))
  return { x0, y0, x1, y1 }
}
function overlap(a, b) {
  const ix0 = Math.max(a.x0, b.x0), iy0 = Math.max(a.y0, b.y0)
  const ix1 = Math.min(a.x1, b.x1), iy1 = Math.min(a.y1, b.y1)
  const iw = Math.max(0, ix1 - ix0), ih = Math.max(0, iy1 - iy0)
  const inter = iw * ih
  const areaA = Math.max(0, a.x1 - a.x0) * Math.max(0, a.y1 - a.y0)
  const areaB = Math.max(0, b.x1 - b.x0) * Math.max(0, b.y1 - b.y0)
  const union = areaA + areaB - inter
  return union ? inter/union : 0
}

export default function HighlightedImage({ src, numeroAlvo, cor='#22c55e' }) {
  const imgRef = useRef(null)
  const canvasRef = useRef(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    if (!src || !numeroAlvo) return
    let cancel = false
    async function run() {
      setStatus('Reconhecendo texto...')
      try {
        const { data } = await Tesseract.recognize(src, 'eng', {logger: ()=>{}})
        if (cancel) return
        const words = (data.words||[]).map(w => ({
          text: w.text,
          bbox: { x0:w.bbox.x0, y0:w.bbox.y0, x1:w.bbox.x1, y1:w.bbox.y1 }
        }))
        const target = normDigits(numeroAlvo)
        const matches = findMatches(words, target)
        drawBoxes(matches)
        setStatus(matches.length ? `✅ Destacado ${matches.length} ocorrência(s)` : '⚠️ Número não encontrado na imagem')
      } catch (e) {
        console.error(e)
        setStatus('Erro ao processar imagem')
      }
    }
    run()
    return () => { cancel = true }
  }, [src, numeroAlvo])

  function drawBoxes(boxes) {
    const img = imgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return
    const w = img.naturalWidth, h = img.naturalHeight
    canvas.width = w; canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0,0,w,h)
    ctx.lineWidth = Math.max(3, Math.min(w,h)/200)
    ctx.strokeStyle = cor
    ctx.fillStyle = cor + '33'
    for (const b of boxes) {
      const x = b.x0, y = b.y0, ww = b.x1 - b.x0, hh = b.y1 - b.y0
      ctx.fillRect(x,y,ww,hh)
      ctx.strokeRect(x,y,ww,hh)
    }
    const scale = () => {
      const rect = img.getBoundingClientRect()
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
    }
    scale(); new ResizeObserver(scale).observe(img)
  }

  return (
    <div className="preview-wrap">
      <img ref={imgRef} className="preview-img" src={src} alt="canhoto" />
      <canvas ref={canvasRef} className="overlay-canvas" />
      <div className="note" style={{padding:'6px 8px'}}>Status OCR: {status}</div>
    </div>
  )
}
