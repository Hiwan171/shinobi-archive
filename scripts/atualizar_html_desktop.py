"""Gera chamadas para atualizar a medida HTML no projeto de validação aberto."""
import argparse,json,pathlib
from construir_html_powerbi import expression_for,read_model,MODEL
ROOT=pathlib.Path(__file__).resolve().parents[1]
compiled=json.loads((ROOT/'powerbi/build/html/ShinobiArchiveHTML.bim').read_text(encoding='utf-8'))
parser=argparse.ArgumentParser();parser.add_argument('--port',type=int,required=True);args=parser.parse_args()
definitions=[]
for name in ['InterfaceHTML','TecnicasCuradas']:
    partition=next(t for t in compiled['model']['tables'] if t['name']==name)['partitions'][0]
    definitions.append({'name':name,'tableName':name,'sourceType':'M','expression':'\n'.join(partition['source']['expression'])})
calls=[{'name':'connection_operations','arguments':{'request':{'operation':'Connect','connectionString':f'data source=localhost:{args.port};Application Name=MCP-PBIModeling'}}},
    {'name':'partition_operations','arguments':{'request':{'operation':'Update','definitions':definitions}}},
    {'name':'partition_operations','arguments':{'request':{'operation':'RefreshWithXMLA','refreshDefinitions':[{'tableName':d['tableName'],'name':d['name'],'refreshType':'Full'} for d in definitions]}}},
    {'name':'measure_operations','arguments':{'request':{'operation':'Update','definitions':[{'name':'Interface Naruto HTML','tableName':'Indicadores','expression':expression_for(read_model()),'displayFolder':'Interface HTML'}]}}},
    {'name':'model_operations','arguments':{'request':{'operation':'RefreshWithXMLA','refreshType':'Calculate'}}},
    {'name':'dax_query_operations','arguments':{'request':{'operation':'Execute','query':'EVALUATE ROW("HtmlLength", LEN([Interface Naruto HTML]), "Personagens", [Personagens], "Episodios", [Episódios], "Votos", [Votos do recorte])','resultMode':'Inline'}}},
    {'name':'dax_query_operations','arguments':{'request':{'operation':'Execute','query':'EVALUATE ROW("html", [Interface Naruto HTML])','resultMode':'Inline','maxRows':1}}},
    {'name':'database_operations','arguments':{'request':{'operation':'ExportToTmdlFolder','tmdlFolderPath':str(MODEL/'definition')}}}]
(ROOT/'powerbi/build/html/atualizar.json').write_text(json.dumps(calls,ensure_ascii=False,indent=2),encoding='utf-8')
