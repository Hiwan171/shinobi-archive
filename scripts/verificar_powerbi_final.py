"""Prepara ajustes de relação e consultas de aceitação no Desktop aberto."""
import json,pathlib,sys
from construir_modelo_powerbi import stable

ROOT=pathlib.Path(__file__).resolve().parents[1]
def call(name,**request):return {'name':name,'arguments':{'request':request}}
model=json.loads((ROOT/'powerbi/build/ShinobiArchive.bim').read_text(encoding='utf-8'))
measures=next(t for t in model['model']['tables'] if t['name']=='Indicadores')['measures']
query='EVALUATE ROW('+', '.join('"'+m['name']+'", ['+m['name']+']' for m in measures)+')'
calls=[call('connection_operations',operation='Connect',connectionString='data source=localhost:60085;Application Name=MCP-PBIModeling'),
    call('relationship_operations',operation='Delete',references=[{'name':stable('series_episodes')}]),
    call('relationship_operations',operation='Create',definitions=[{'name':stable('series_episodes'),
        'fromTable':'arcos','fromColumn':'serie_anilist_id','toTable':'Series','toColumn':'serie_anilist_id',
        'fromCardinality':'Many','toCardinality':'One','crossFilteringBehavior':'OneDirection'}]),
    call('measure_operations',operation='Update',definitions=[{'tableName':'Indicadores',
        'name':'Votos do recorte','formatString':'#,0',
        'expression':"VAR Regiao = SELECTEDVALUE('Regioes'[regiao], \"all\") RETURN CALCULATE(SUM('votacao_narutop99'[votos]), REMOVEFILTERS('Regioes'), TREATAS({Regiao}, 'votacao_narutop99'[regiao]))"}]),
    call('model_operations',operation='RefreshWithXMLA',refreshType='Calculate'),
    call('dax_query_operations',operation='Execute',query=query,resultMode='Inline'),
    call('dax_query_operations',operation='Execute',query='EVALUATE SUMMARIZECOLUMNS(\'Series\'[nome], "Episodios", [Episódios], "Arcos", COUNTROWS(\'arcos\'))',resultMode='Inline'),
    call('dax_query_operations',operation='Execute',query='EVALUATE CALCULATETABLE(ROW("Nome", [Nome da ficha], "Tecnicas", [Técnicas da ficha]), \'personagens\'[nome] = "Sasuke Uchiha")',resultMode='Inline'),
    call('dax_query_operations',operation='Execute',query='EVALUATE CALCULATETABLE(ROW("Altura", [Altura da ficha]), \'Fases\'[contexto_original] = "Part I")',resultMode='Inline'),
    call('database_operations',operation='ExportToTmdlFolder',tmdlFolderPath=str(ROOT/'powerbi/ShinobiArchive/ShinobiArchive.SemanticModel/definition'))]
(ROOT/'powerbi/build/verificar_final.json').write_text(json.dumps(calls,ensure_ascii=False,indent=2),encoding='utf-8')
print('Consultas de aceitação: 48 medidas, séries, seleção e fase.')
