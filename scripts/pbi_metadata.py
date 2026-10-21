"""Consulta e armazena os contratos de visuais do CLI oficial."""
import concurrent.futures,json,os,pathlib,subprocess

ROOT=pathlib.Path(__file__).resolve().parents[1]
CLI=pathlib.Path(os.environ['APPDATA'])/'npm/node_modules/@microsoft/powerbi-report-authoring-cli/dist/cli.js'
OUT=ROOT/'powerbi/references/metadata'
OUT.mkdir(exist_ok=True)

def run(*args):
    proc=subprocess.run(['node',str(CLI),*args],capture_output=True,text=True,encoding='utf-8')
    try:result=json.loads(proc.stdout)
    except ValueError:raise RuntimeError(proc.stdout+proc.stderr)
    if proc.returncode:raise RuntimeError(result)
    return result

def get(kind):
    cap=run('catalog','describe',kind)
    objs=run('formatting','list-objects',kind)
    (OUT/(kind+'_catalog.json')).write_text(json.dumps(cap,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/(kind+'_objects.json')).write_text(json.dumps(objs,ensure_ascii=False,indent=2),encoding='utf-8')
    return {'type':kind,'catalog':cap}

if __name__=='__main__':
    kinds=['image','cardVisual','advancedSlicerVisual','slicer','textSlicer','actionButton','shape','textbox',
           'barChart','columnChart','donutChart','tableEx','pivotTable','pageNavigator','treemap']
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for item in pool.map(get,kinds):
            print(json.dumps(item,ensure_ascii=True),flush=True)
