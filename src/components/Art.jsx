// Ilustrações geradas a partir dos dados do TCC (capas e figuras de demonstração).
import { useId } from 'react'

const MATIZ = {
  Redes: 212, IA: 268, 'Segurança': 352, 'Engenharia de Software': 152, 'Banco de Dados': 32,
  'Computação Gráfica': 318, IHC: 186, 'Sistemas Distribuídos': 232, 'Robótica': 14,
  'Educação': 96, 'Visão Computacional': 290, 'Teoria da Computação': 50,
}

export function matiz(tag = '') {
  if (tag in MATIZ) return MATIZ[tag]
  let h = 0
  for (const c of tag) h = (h * 31 + c.charCodeAt(0)) % 360
  return h
}

function aleatorio(semente) {
  let s = 0
  for (const c of semente) s = (s * 131 + c.charCodeAt(0)) >>> 0
  for (let i = 0; i < 8; i++) s = (s * 1664525 + 1013904223) >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}

export function Capa({ tcc, className = '' }) {
  const gid = useId()
  const upload = tcc.midias.find((m) => m.src)
  if (upload) return <img className={`capa ${className}`} src={upload.src} alt={upload.descricao || tcc.titulo} />

  const h1 = matiz(tcc.tags[0])
  const h2 = matiz(tcc.tags[1] || tcc.tags[0])
  const r = aleatorio(tcc.id + tcc.titulo)
  const nos = Array.from({ length: 16 }, () => ({ x: 20 + r() * 360, y: 15 + r() * 195, s: 2 + r() * 5 }))
  const arestas = []
  nos.forEach((a, i) => nos.slice(i + 1).forEach((b) => {
    if (Math.hypot(a.x - b.x, a.y - b.y) < 95) arestas.push([a, b])
  }))
  return (
    <svg className={`capa ${className}`} viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={`hsl(${h1} 72% 58%)`} />
          <stop offset="1" stopColor={`hsl(${h2} 62% 28%)`} />
        </linearGradient>
      </defs>
      <rect width="400" height="225" fill={`url(#${gid})`} />
      {arestas.map(([a, b], i) => (
        <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="white" strokeOpacity=".28" strokeWidth="1.2" />
      ))}
      {nos.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r={n.s} fill="white" fillOpacity={0.5 + (i % 3) * 0.2} />)}
    </svg>
  )
}

// Figura de demonstração anexada ao TCC (Midia). Uploads reais são exibidos como imagem.
export function Figura({ midia, tcc, indice }) {
  if (midia.src) return <img className="figura" src={midia.src} alt={midia.descricao} />
  const h = matiz(tcc.tags[indice % tcc.tags.length] || tcc.tags[0])
  const cor = `hsl(${h} 60% 45%)`
  const claro = `hsl(${h} 70% 92%)`
  const r = aleatorio(tcc.id + indice)
  let corpo
  if (midia.tipo === 'barras') {
    corpo = Array.from({ length: 6 }, (_, i) => {
      const alt = 30 + r() * 120
      return <rect key={i} x={40 + i * 55} y={180 - alt} width="34" height={alt} rx="4" fill={i % 2 ? claro : cor} stroke={cor} />
    })
  } else if (midia.tipo === 'linha') {
    let y = 150
    const pts = Array.from({ length: 10 }, (_, i) => { y = Math.max(30, Math.min(170, y - 20 + r() * 26)); return `${30 + i * 37},${y}` })
    corpo = (
      <>
        <polyline points={pts.join(' ')} fill="none" stroke={cor} strokeWidth="3" strokeLinejoin="round" />
        {pts.map((p, i) => { const [x, yy] = p.split(','); return <circle key={i} cx={x} cy={yy} r="4" fill="white" stroke={cor} strokeWidth="2" /> })}
      </>
    )
  } else if (midia.tipo === 'grafo') {
    const nos = Array.from({ length: 9 }, () => ({ x: 40 + r() * 320, y: 30 + r() * 140 }))
    corpo = (
      <>
        {nos.map((a, i) => nos.slice(i + 1, i + 3).map((b, j) => (
          <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={cor} strokeOpacity=".5" strokeWidth="2" />
        )))}
        {nos.map((n, i) => <circle key={i} cx={n.x} cy={n.y} r="11" fill={i === 0 ? cor : claro} stroke={cor} strokeWidth="2" />)}
      </>
    )
  } else {
    corpo = (
      <>
        <rect x="30" y="20" width="340" height="160" rx="10" fill="white" stroke={cor} strokeWidth="2" />
        <rect x="30" y="20" width="340" height="24" rx="10" fill={claro} />
        <rect x="50" y="60" width="140" height="100" rx="6" fill={claro} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x="210" y={62 + i * 24} width={140 - i * 25} height="10" rx="5" fill={i ? '#e3e3e3' : cor} />)}
      </>
    )
  }
  return (
    <svg className="figura" viewBox="0 0 400 200" role="img" aria-label={midia.descricao}>
      <rect width="400" height="200" fill="#fbfaf8" />
      {midia.tipo !== 'tela' && <line x1="25" y1="182" x2="380" y2="182" stroke="#d6d3cd" />}
      {corpo}
    </svg>
  )
}

export function Avatar({ nome, tamanho = 28 }) {
  const iniciais = nome.replace(/^Prof(ª|\.)\s*/, '').split(' ').map((p) => p[0]).slice(0, 2).join('')
  return (
    <span className="avatar" style={{ width: tamanho, height: tamanho, fontSize: tamanho * 0.4, background: `hsl(${matiz(nome)} 45% 88%)`, color: `hsl(${matiz(nome)} 45% 30%)` }}>
      {iniciais}
    </span>
  )
}

export function Tag({ nome, ativo, onClick, onRemover }) {
  const h = matiz(nome)
  return (
    <span
      className={`tag ${ativo ? 'ativo' : ''} ${onClick ? 'clicavel' : ''}`}
      style={{ '--h': h }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => (e.key === 'Enter' || e.key === ' ') && onClick() : undefined}
    >
      {nome}
      {onRemover && (
        <button type="button" className="tag-x" aria-label={`Remover ${nome}`} onClick={(e) => { e.stopPropagation(); onRemover() }}>×</button>
      )}
    </span>
  )
}
