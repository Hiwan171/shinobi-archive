"""Lê coordenadas das folhas; os pixels originais permanecem intactos."""
import json,pathlib,sys
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1]
def row_frames(file,box,gap=4,min_width=12):
    im=Image.open(ROOT/file).convert('RGB');pix=im.load();bg=pix[0,0]
    x0,y0,x1,y1=box
    # O cinza 250 é a cor das chaves de repetição adicionadas pelo responsável
    # pelas folhas de Shinobi Rumble. Ignorá-las na leitura evita incluí-las no recorte.
    def visible(x,y):return pix[x,y]!=bg and not (bg==(0,64,128) and pix[x,y]==(250,250,250))
    occupied=[x for x in range(x0,x1) if any(visible(x,y) for y in range(y0,y1))]
    groups=[]
    for x in occupied:
        if not groups or x-groups[-1][-1]>gap:groups.append([x])
        else:groups[-1].append(x)
    frames=[]
    for group in groups:
        a,b=group[0],group[-1]+1
        points=[(x,y) for x in range(a,b) for y in range(y0,y1) if visible(x,y)]
        top=min(y for x,y in points);bottom=max(y for x,y in points)+1
        if b-a>=min_width and bottom-top>=8:frames.append([a,top,b-a,bottom-top])
    return frames
if __name__=='__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    print(json.dumps(row_frames(sys.argv[1],list(map(int,sys.argv[2:6])))))
