"""Organiza as evidências da auditoria existente, sem recompilar o painel."""
import base64
import gzip
import hashlib
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'powerbi/auditoria-visual'


def main():
    import sys
    sys.path.insert(0, str(ROOT / 'scripts'))
    from construir_html_powerbi import compose_interface

    shell = compose_interface()
    code_hash = hashlib.sha256(shell.encode('utf-8')).hexdigest()
    models = [
        ROOT / 'powerbi/ShinobiArchiveHTML/ShinobiArchiveHTML.SemanticModel/definition/tables/InterfaceHTML.tmdl',
        ROOT / 'powerbi/build/quiz-desktop-validation/ShinobiQuizValidacao.SemanticModel/definition/tables/InterfaceHTML.tmdl',
        ROOT / 'entrega/ShinobiArchive_HTML_Content/ShinobiArchiveHTML/ShinobiArchiveHTML.SemanticModel/definition/tables/InterfaceHTML.tmdl',
    ]
    hashes = {}
    for model in models:
        encoded = re.search(r'Binary.FromText\("([^"]+)", BinaryEncoding.Base64', model.read_text(encoding='utf-8')).group(1)
        chunks = json.loads(gzip.decompress(base64.b64decode(encoded)))
        embedded = ''.join(chunk['conteudo'][1:-1] for chunk in chunks)
        assert embedded == shell, str(model)
        hashes[str(model.relative_to(ROOT))] = hashlib.sha256(embedded.encode('utf-8')).hexdigest()
    preview = (ROOT / 'powerbi/html-interface/preview.html').read_text(encoding='utf-8')
    preview_shell = preview.split('<body>', 1)[1].rsplit('</body>', 1)[0]
    preview_shell = re.sub(r'(<script id="ninja-data" type="application/json">).*?(</script>)', r'\1__NARUTO_DATA__\2', preview_shell, flags=re.S)
    assert preview_shell == shell
    html_proof = json.loads((OUT / 'medicoes-html.json').read_text(encoding='utf-8'))
    native_proof = json.loads((OUT / 'medicoes-powerbi.json').read_text(encoding='utf-8-sig'))
    assert len(html_proof['shots']) == 40 and not html_proof['errors']
    assert len(native_proof['shots']) == 19
    # Detecta o painel de informações do título do Desktop sobre as capturas.
    assert all(not any('Visual Studio Code' in c['name'] for c in shot['controls']) for shot in native_proof['shots']), 'Desktop overlay obscures a capture'
    findings = json.loads((OUT / 'achados.json').read_text(encoding='utf-8'))
    assert len(findings) == len({f['id'] for f in findings}) == 10
    for finding in findings:
        for evidence in finding['evidencias']:
            assert (OUT / evidence).is_file(), evidence
    captures = [dict(name=s['name'], file=s['name']+'.png', host='html', tab=s['page'], size=f"{s['viewport']['width']}×{s['viewport']['height']}") for s in html_proof['shots']]
    captures += [dict(name=s['name'], file=s['name']+'.png', host='powerbi', tab=s['name'].split('-')[1], size='Desktop · 81%') for s in native_proof['shots']]
    for capture in captures:
        assert (OUT / capture['file']).is_file()
    integrity = dict(interfaceSha256=code_hash, sameCodeInMainValidationDeliveryAndPreview=True, models=hashes,
                     htmlCaptures=40, nativeCaptures=19, javascriptErrors=html_proof['errors'],
                     desktopVersion=native_proof['version'], desktopProject=native_proof['project'],
                     highPriority=4, mediumPriority=2, lowPriority=4, productModified=False)
    (OUT / 'integridade.json').write_text(json.dumps(integrity, ensure_ascii=False, indent=2), encoding='utf-8')
    dataset = json.dumps(dict(findings=findings, captures=captures), ensure_ascii=False).replace('<', '\\u003c')
    template = '''<!doctype html>
<html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Auditoria visual · Shinobi Archive</title>
<style>
:root{color-scheme:dark;font:16px/1.6 system-ui,sans-serif;background:#10151b;color:#e5eaf0}*{box-sizing:border-box}body{margin:0}main{max-width:1480px;margin:auto;padding:40px 28px}h1{font-size:clamp(28px,4vw,44px);line-height:1.15;margin:8px 0 20px}h2{font-size:24px;margin:32px 0 14px}h3{font-size:20px;line-height:1.35;margin:12px 0}p{margin:8px 0 14px}.intro{max-width:960px;color:#bec9d5}a{color:#f1c48c;text-underline-offset:4px}button,select{font:inherit;background:#1a232e;color:#ecf0f6;border:1px solid #4c5b6d;border-radius:7px;padding:8px 12px}button{cursor:pointer}button[aria-pressed=true]{border-color:#e7b473;background:#473722}button:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid #f3cb94;outline-offset:3px}.eyebrow{color:#edb97a;letter-spacing:2px;font-size:13px}.counts,.tabs,.filters{display:flex;flex-wrap:wrap;gap:12px;margin:20px 0}.counts span{padding:12px 18px;background:#1a232e;border:1px solid #36404b;border-radius:8px}.filters label{display:flex;align-items:center;gap:8px;color:#c3cfdb}.filters{padding:14px 0;border-top:1px solid #36404b;border-bottom:1px solid #36404b}.findings{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.finding{padding:22px;background:#19212a;border:1px solid #34404f;border-radius:10px}.tag{font-size:13px;padding:4px 8px;border-radius:4px;background:#35414f}.Alta{color:#ffb6a8;background:#4c2929}.Média{color:#f3d39e;background:#443b29}.Baixa{color:#bbdccd;background:#29423b}.finding p{color:#c6d0db}.finding strong{color:#e9eef5}.links{display:flex;gap:14px;flex-wrap:wrap;font-size:14px}.gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.gallery figure{margin:0;background:#182029;border:1px solid #34404f;border-radius:8px;overflow:hidden}.gallery img{display:block;width:100%;height:auto;background:#080b10}.gallery figcaption{padding:12px 16px;color:#cbd4df}.gallery figcaption small{display:block;color:#a9b9ca}details{border:1px solid #394655;padding:12px 18px;border-radius:8px;margin:22px 0}summary{cursor:pointer;color:#f1c48c}footer{margin-top:36px;color:#a9b9ca}.empty{padding:20px;background:#19212a}.caption{color:#aebdcb;font-size:14px}.links a{overflow-wrap:anywhere}@media(max-width:900px){.findings,.gallery{grid-template-columns:1fr}main{padding:24px 16px}.filters label{flex-wrap:wrap}}
</style><main>
<div class="eyebrow">SHINOBI ARCHIVE / 21.10.2026</div>
<h1>Auditoria visual das seis abas.</h1>
<p class="intro">Preservar a identidade e recuperar espaço para os dados. A revisão encontrou quatro ajustes prioritários de composição, dois de acabamento e quatro simplificações pontuais. A interface permanece sem alterações.</p>
<div class="counts"><span><strong>40</strong> capturas HTML</span><span><strong>19</strong> capturas Power BI</span><span><strong>10</strong> achados</span><span><strong>0</strong> erros JavaScript no percurso</span></div>
<p><a href="AUDITORIA_VISUAL.md">Ler relatório completo</a> · <a href="integridade.json">Conferir integridade</a> · <a href="achados.json">Achados em JSON</a></p>
<details><summary>Como a revisão foi feita</summary><p>HTML em 1600×1000, 1600×900 e 1366×768, incluindo estados internos das abas. Power BI Desktop em uma cópia local de validação com o mesmo código incorporado do projeto principal: janela de 1936×1039, relatório a 81% e canvas lógico de 1600×1000.</p><p>O relatório no Desktop é escalado; a prévia HTML também responde ao tamanho da janela. As evidências descrevem cada contexto separadamente. A amostra não inclui Power BI Service, celulares nem todos os perfis individuais. Contraste foi avaliado visualmente, sem certificação de acessibilidade.</p></details>
<nav class="tabs" aria-label="Filtrar por aba"></nav>
<div class="filters"><label>Prioridade dos achados <select id="priority"><option value="all">Todas</option><option>Alta</option><option>Média</option><option>Baixa</option></select></label><label>Capturas <select id="host"><option value="all">HTML e Power BI</option><option value="html">HTML</option><option value="powerbi">Power BI Desktop</option></select></label><label>Dimensão <select id="size"><option value="all">Todas</option><option>1600×1000</option><option>1600×900</option><option>1366×768</option><option>Desktop · 81%</option></select></label></div>
<h2>O que ajustar</h2><p class="caption">A prioridade considera o acesso ao conteúdo e a preferência pelo painel compacto. As recomendações ainda não foram aplicadas.</p><div id="findings" class="findings" aria-live="polite"></div>
<h2>Evidências visuais</h2><p class="caption">Clique na imagem para abrir a captura inteira. Os controles acima permitem comparar as abas e os ambientes.</p><p id="count" aria-live="polite"></p><div id="gallery" class="gallery"></div>
<footer>Preservar: seis abas, artes originais, paleta, navegação, métricas e referências. Priorizar: espaço útil, ações visíveis e legendas com presença.</footer>
</main><script type="application/json" id="audit-data">__DATA__</script>
<script>
const audit=JSON.parse(document.querySelector('#audit-data').textContent),names={geral:'Todas as abas',arquivo:'Arquivo Ninja',grupos:'Mundo Shinobi',comparador:'Frente a Frente',popularidade:'Popularidade',episodios:'Episódios',quiz:'Exame Shinobi'};let tab='all';
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.querySelector('.tabs').innerHTML=[['all','Todas'],...Object.entries(names).filter(([k])=>k!=='geral')].map(([k,v])=>`<button data-tab="${k}" aria-pressed="${k===tab}">${v}</button>`).join('');
function render(){
 document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tab===tab)));
 const priority=document.querySelector('#priority').value,host=document.querySelector('#host').value,size=document.querySelector('#size').value;
 const findings=audit.findings.filter(f=>(tab==='all'||f.aba===tab||f.aba==='geral')&&(priority==='all'||priority===f.prioridade));
 document.querySelector('#findings').innerHTML=findings.map(f=>`<article class="finding"><span class="tag ${f.prioridade}">${f.id} · ${f.prioridade}</span> <span class="caption">${names[f.aba]}</span><h3>${esc(f.titulo)}</h3><p>${esc(f.observacao)}</p><p><strong>Recomendação:</strong> ${esc(f.recomendacao)}</p><p><strong>Conferir depois:</strong> ${esc(f.aceite)}</p><div class="links">${f.evidencias.map((s,i)=>`<a href="${s}" target="_blank" rel="noopener">${s.startsWith('powerbi')?'Power BI':'HTML'} · evidência ${i+1}</a>`).join('')}</div></article>`).join('')||'<p class="empty">Nenhum achado com esse filtro.</p>';
 const captures=audit.captures.filter(c=>(tab==='all'||c.tab===tab)&&(host==='all'||host===c.host)&&(size==='all'||size===c.size));
 document.querySelector('#count').textContent=captures.length+' capturas neste filtro.';
 document.querySelector('#gallery').innerHTML=captures.map(c=>`<figure><a href="${c.file}" target="_blank" rel="noopener"><img loading="lazy" src="${c.file}" alt="${esc(names[c.tab]+' · '+c.name)}"></a><figcaption>${names[c.tab]} · ${c.host==='html'?'HTML':'Power BI'} · ${c.size}<small>${esc(c.name)}</small></figcaption></figure>`).join('');
}
document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(b){tab=b.dataset.tab;render()}});document.querySelectorAll('select').forEach(s=>s.addEventListener('change',render));render();
</script></html>'''
    (OUT / 'index.html').write_text(template.replace('__DATA__', dataset), encoding='utf-8')
    print(json.dumps(integrity, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
