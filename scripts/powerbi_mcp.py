"""Cliente stdio para a extensão Power BI Authoring MCP já instalada.

Uso: python scripts/powerbi_mcp.py --list
     python scripts/powerbi_mcp.py --calls caminho.json
O arquivo de chamadas contém [{"name":...,"arguments":...}, ...].
"""
import argparse,json,pathlib,queue,subprocess,sys,threading,time

ROOT=pathlib.Path(__file__).resolve().parents[1]
SERVERS=sorted((pathlib.Path.home()/'.vscode/extensions').glob('*/server/powerbi-modeling-mcp.exe'))

class Client:
    def __init__(self):
        if not SERVERS:
            raise RuntimeError('Power BI Authoring MCP extension not found')
        self.proc=subprocess.Popen([str(SERVERS[-1]),'--start'],stdin=subprocess.PIPE,stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,text=True,encoding='utf-8',bufsize=1,creationflags=subprocess.CREATE_NO_WINDOW)
        self.out=queue.Queue();self.index=0
        threading.Thread(target=self.reader,daemon=True).start()
        threading.Thread(target=lambda:list(self.proc.stderr),daemon=True).start()
        self.request('initialize',{'protocolVersion':'2024-11-05','capabilities':{},'clientInfo':{'name':'ShinobiArchive','version':'1.0'}})
        self.proc.stdin.write(json.dumps({'jsonrpc':'2.0','method':'notifications/initialized'})+'\n');self.proc.stdin.flush()
    def reader(self):
        for line in self.proc.stdout:
            try:self.out.put(json.loads(line))
            except json.JSONDecodeError:pass
    def request(self,method,params,timeout=90):
        self.index+=1
        msg={'jsonrpc':'2.0','id':self.index,'method':method,'params':params}
        self.proc.stdin.write(json.dumps(msg,ensure_ascii=False)+'\n');self.proc.stdin.flush()
        until=time.monotonic()+timeout
        while time.monotonic()<until:
            data=self.out.get(timeout=max(0.01,until-time.monotonic()))
            if data.get('id')==self.index:
                if 'error' in data:raise RuntimeError(data['error'])
                return data.get('result')
        raise TimeoutError(method)
    def close(self):
        self.proc.stdin.close()
        try:self.proc.wait(timeout=3)
        except subprocess.TimeoutExpired:self.proc.terminate()

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--list',action='store_true');parser.add_argument('--calls')
    args=parser.parse_args();client=Client()
    try:
        if args.list:
            result=client.request('tools/list',{})
            target=ROOT/'powerbi/references/modeling_tools.json';target.write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
            print(json.dumps([{'name':t['name'],'description':t.get('description','')[:250]} for t in result['tools']],ensure_ascii=False,indent=2))
        if args.calls:
            results=[]
            for call in json.loads(pathlib.Path(args.calls).read_text(encoding='utf-8-sig')):
                result=client.request('tools/call',call,timeout=180)
                results.append(result)
                print(json.dumps(result,ensure_ascii=False),flush=True)
                if result.get('isError'):
                    (ROOT/'powerbi/references/last_mcp_result.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
                    raise RuntimeError('MCP operation failed: '+call['name'])
            (ROOT/'powerbi/references/last_mcp_result.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
    finally:client.close()

if __name__=='__main__':
    sys.stdout.reconfigure(encoding='utf-8');main()
