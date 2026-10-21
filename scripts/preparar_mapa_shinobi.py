"""Adapta somente estilo/identificação do SVG licenciado, preservando geometrias."""
import hashlib,json,pathlib,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parents[1]
folder=ROOT/'assets/maps'
source=folder/'naruto-world-original.svg'
ET.register_namespace('', 'http://www.w3.org/2000/svg')
svg=ET.Element('{http://www.w3.org/2000/svg}svg',{'viewBox':'0 0 1500 882.2204','role':'img','aria-label':'Atlas das grandes nações do mundo shinobi'})
ET.SubElement(svg,'title').text='Mundo Shinobi — adaptação de Naruto World Map, ShounenSuki, CC BY-SA 4.0'
ET.SubElement(svg,'metadata').text='https://commons.wikimedia.org/wiki/File:Naruto_World_Map.svg | https://creativecommons.org/licenses/by-sa/4.0/ | Adaptação visual e interatividade: Shinobi Archive, 2026.'
countries={'path3199':11,'path3197':17,'path3174':28,'path3201':16,'path3195':14}
for e in ET.parse(source).getroot():
    if e.get('id')=='path3169':break
    if not e.tag.endswith('path') or e.get('id')=='rect3552':continue
    attrs={k:e.get(k) for k in ['d','transform'] if e.get(k)}
    attrs.update({'class':'atlas-land','id':'atlas-'+e.get('id'),'fill':'#233a3a','stroke':'#56716b','stroke-width':'2'})
    if e.get('id') in countries:attrs['data-world-village']=str(countries[e.get('id')])
    ET.SubElement(svg,'path',attrs)
out=folder/'naruto-world-atlas.svg'
ET.ElementTree(svg).write(out,encoding='utf-8',xml_declaration=False)
manifest={'author':'ShounenSuki','source':'https://commons.wikimedia.org/wiki/File:Naruto_World_Map.svg','license':'CC BY-SA 4.0','licenseUrl':'https://creativecommons.org/licenses/by-sa/4.0/','changes':'Cores, remoção de inscrições e símbolos, identificadores interativos. Geometrias territoriais preservadas.','scope':'Mapa comunitário da região conhecida das grandes nações; não representa o planeta completo. Marcadores são esquemáticos, sem escala de distância.','files':{p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in [source,out]}}
(ROOT/'data/editorial/mapa_shinobi.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(folder/'LICENSE.md').write_text('# Naruto World Map\n\nAutor: ShounenSuki. Fonte: '+manifest['source']+'\n\nOriginal e adaptação naruto-world-atlas.svg: Creative Commons Attribution-ShareAlike 4.0 International. '+manifest['licenseUrl']+'\n\n'+manifest['changes']+'\n\n'+manifest['scope']+'\n',encoding='utf-8')
print(json.dumps({'paths':len(svg.findall('path')),'files':manifest['files']}))
