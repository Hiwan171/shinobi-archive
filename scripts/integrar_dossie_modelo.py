"""Cria as três tabelas editoriais no projeto HTML já aberto, sem recriar o modelo."""
import json,pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
model=json.loads((ROOT/'powerbi/build/html/ShinobiArchiveHTML.bim').read_text(encoding='utf-8'))
names=['BiografiasCuradas','HistoriaPersonagem','TecnicasCuradas']
definitions=[]
for t in model['model']['tables']:
    if t['name'] not in names:continue
    definitions.append({'name':t['name'],'isHidden':True,'lineageTag':t['lineageTag'],
        'mode':'Import','partitionName':t['name'],'columns':t['columns'],
        'mExpression':'\n'.join(t['partitions'][0]['source']['expression'])})
calls=[{'name':'connection_operations','arguments':{'request':{'operation':'Connect','connectionString':'data source=localhost:52106;Application Name=MCP-PBIModeling'}}}]
# Nesta versão da extensão, criar individualmente evita a reversão silenciosa do lote.
for definition in definitions:
    calls.append({'name':'table_operations','arguments':{'request':{'operation':'Create','definitions':[definition],
        'options':{'continueOnError':True,'useTransaction':False}}}})
for name in names:
    calls.append({'name':'partition_operations','arguments':{'request':{'operation':'RefreshWithXMLA',
        'refreshDefinitions':[{'tableName':name,'refreshType':'Full'}]}}})
calls.append({'name':'table_operations','arguments':{'request':{'operation':'List'}}})
(ROOT/'powerbi/build/html/integrar_dossie.json').write_text(json.dumps(calls,ensure_ascii=False,indent=2),encoding='utf-8')
