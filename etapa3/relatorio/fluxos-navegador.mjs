// Percorre no navegador os fluxos novos do protótipo (CT51 a CT54, CT33, CT41) e tira capturas.
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'

const BASE = process.argv[2] || 'http://localhost:4173/subsTCCk/'
const SAIDA = process.argv[3] || 'shots'
fs.mkdirSync(SAIDA, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
  args: ['--lang=pt-BR'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 820 })
const erros = []
page.on('pageerror', (e) => erros.push(String(e)))
page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()) })

const espera = (ms) => new Promise((r) => setTimeout(r, ms))
const ir = async (h) => { await page.evaluate((x) => { window.location.hash = x }, h); await espera(350) }
const texto = () => page.evaluate(() => document.body.innerText)
const clicar = async (seletor, conteudo) => {
  const ok = await page.evaluate((s, c) => {
    const el = [...document.querySelectorAll(s)].find((e) => e.innerText.trim().includes(c))
    if (el) { el.click(); return true }
    return false
  }, seletor, conteudo)
  if (!ok) throw new Error(`não achei ${seletor} com "${conteudo}"`)
  await espera(300)
}
const foto = async (nome, cheia = false) => page.screenshot({ path: `${SAIDA}/${nome}.png`, fullPage: cheia })
const checar = (cond, msg) => { console.log(`${cond ? 'OK  ' : 'FALHA'} ${msg}`); if (!cond) process.exitCode = 1 }
const digitar = async (sel, valor) => {
  await page.$eval(sel, (el) => { el.focus() })
  await page.click(sel, { clickCount: 3 })
  await page.keyboard.press('Backspace')
  await page.type(sel, valor)
}
const escolher = (sel, valor) => page.select(sel, valor)
const entrar = async (cartao) => {
  await ir('/entrar')
  await digitar('#cartao', cartao)
  await digitar('#senha', 'demo')
  await clicar('form button', 'Entrar')
  await espera(400)
}
const sair = async () => { await page.click('button[aria-label="Sair"]'); await espera(300) }

await page.goto(BASE + '#/', { waitUntil: 'networkidle0' })
await page.evaluate(() => localStorage.clear())
await page.reload({ waitUntil: 'networkidle0' })
await espera(500)
await foto('01-feed')

// CT33: "IA" não encontra "anomalias"; CT03 com filtros
await ir('/buscar?termo=IA')
await foto('02-busca-ia')
await ir('/tcc/a')
await foto('03-detalhe', true)

// CT51: rascunho só com o título
await entrar('00312345')
await ir('/novo')
await clicar('button', 'Salvar como rascunho')
checar((await texto()).includes('Para salvar o rascunho, informe pelo menos o título.'), 'CT51: rascunho sem título é barrado')
await foto('04-rascunho-sem-titulo')
await digitar('#titulo', 'Rascunho só com título')
await clicar('button', 'Salvar como rascunho')
await espera(300)
checar((await page.evaluate(() => location.hash)) === '#/perfil' && (await texto()).includes('Rascunho só com título'), 'CT51: rascunho salvo e listado no perfil')

// CT41: semestre atual na lista
await ir('/novo')
const semestres = await page.$$eval('#anoSemestre option', (os) => os.map((o) => o.value).filter(Boolean))
checar(semestres[0] === '2026/2' && !semestres.includes('2027/1'), `CT41: lista começa em ${semestres[0]}`)

// FA01 no cadastro e publicação com o orientador Carlos Lima
await clicar('button[type=submit]', 'Publicar TCC')
await foto('05-cadastro-fa01')
await digitar('#titulo', 'Plataforma para tornar TCCs visíveis e relacionados')
await digitar('#resumo', 'Resumo de demonstração do fluxo de exclusão pelo orientador.')
await escolher('#anoSemestre', '2026/2')
await escolher('#orientador', 'Prof. Carlos Lima')
await page.type('input[aria-label="Nova tag"]', 'Engenharia de Software')
await page.keyboard.press('Enter')
await digitar('#linkLume', 'https://lume.ufrgs.br/handle/10183/300001')
await clicar('button[type=submit]', 'Publicar TCC')
await espera(1300)
checar((await texto()).includes('TCC publicado com sucesso!'), 'CT07: publicação com dados válidos')
await clicar('.modal button', 'Ver publicação')
const id = (await page.evaluate(() => location.hash)).split('/').pop()

// CT52: editar publicado com link inválido
await ir(`/editar/${id}`)
const temBotaoRascunho = (await texto()).includes('Salvar como rascunho')
checar(!temBotaoRascunho, 'CT52: TCC publicado não oferece "Salvar como rascunho" na edição')
await digitar('#linkLume', 'http://exemplo.com/tcc-123')
await clicar('button[type=submit]', 'Publicar TCC')
await espera(1300)
checar((await texto()).includes('As alterações não foram salvas'), 'CT52: edição com link inválido mantém a versão publicada')
await foto('06-edicao-link-invalido')
await clicar('.modal button', 'Corrigir o link')
await ir('/buscar?termo=Plataforma')
checar((await texto()).includes('Plataforma para tornar TCCs visíveis'), 'CT52: o TCC continua na busca')

// CT54: orientador devolve o TCC a rascunho
await sair()
await ir(`/tcc/${id}`)
checar(!(await texto()).includes('Excluir'), 'CT48: visitante não vê "Excluir"')
await entrar('00012345')
await ir(`/tcc/${id}`)
await clicar('button', 'Excluir')
await foto('07-exclusao-orientador')
checar((await texto()).includes('Remover este TCC da sua orientação?'), 'CT54: confirmação do orientador')
await clicar('.modal button', 'Devolver ao aluno')
await ir(`/tcc/${id}`)
checar((await texto()).includes('Este TCC não está disponível.'), 'CT54: o TCC saiu da visão pública')
await ir('/buscar?termo=Plataforma')
checar((await texto()).includes('Nenhum trabalho encontrado'), 'CT54: o TCC saiu da busca')

// O aluno vê o rascunho devolvido e exclui (CT53)
await sair()
await entrar('00312345')
await ir('/perfil')
checar((await texto()).includes('Rascunho (devolvido)'), 'CT54: aparece como rascunho devolvido no perfil do aluno')
await foto('08-perfil-devolvido')
await ir(`/tcc/${id}`)
checar((await texto()).includes('indicou que não orienta este trabalho'), 'CT54: faixa explica a devolução')
await clicar('button', 'Excluir')
checar((await texto()).includes('Excluir este TCC?'), 'CT53: confirmação do autor')
await clicar('.modal button', 'Excluir TCC')
await ir('/perfil')
checar(!(await texto()).includes('Plataforma para tornar TCCs visíveis'), 'CT53: o TCC some do perfil')

// Capturas no celular
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true })
await ir('/')
await foto('09-celular-feed')
await ir('/tcc/b')
await foto('10-celular-detalhe')
await ir('/novo')
await clicar('button[type=submit]', 'Publicar TCC')
await foto('11-celular-cadastro')

checar(erros.length === 0, `sem erros no console (${erros.join(' | ')})`)
await browser.close()
