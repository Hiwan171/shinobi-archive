"""Leitura estática das tabelas de idade/gênero publicadas no NARUTOP99."""
from html.parser import HTMLParser
import re

class Node:
    def __init__(self,tag,attrs=None):
        self.tag=tag
        self.attrs=dict(attrs or [])
        self.children=[]
    def descendants(self):
        for child in self.children:
            if isinstance(child,Node):
                yield child
                yield from child.descendants()
    def has_class(self,name):
        return name in self.attrs.get('class','').split()

class DOM(HTMLParser):
    def __init__(self):
        super().__init__()
        self.root=Node('root')
        self.stack=[self.root]
    def handle_starttag(self,tag,attrs):
        node=Node(tag,attrs)
        self.stack[-1].children.append(node)
        if tag not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:
            self.stack.append(node)
    def handle_endtag(self,tag):
        for i in range(len(self.stack)-1,0,-1):
            if self.stack[i].tag==tag:
                self.stack=self.stack[:i]
                break
    def handle_data(self,data):
        self.stack[-1].children.append(data)

def demographics(html):
    parser=DOM()
    parser.feed(html)
    rows=[]
    ages=['10-19','20-29','30-39','40-49','50-59','60+']
    for grid in parser.root.descendants():
        if not grid.has_class('grid-table') or 'data-gender' not in grid.attrs:
            continue
        rank=0
        for row in grid.descendants():
            if not (row.has_class('row') and row.has_class('rank')):
                continue
            rank+=1
            cells=[cell for cell in row.children if isinstance(cell,Node) and cell.has_class('body')]
            if len(cells)!=6:
                raise ValueError('Unexpected demographic column count')
            for age,cell in zip(ages,cells):
                image=next(node for node in cell.descendants() if node.tag=='img')
                official_id=int(re.search(r'/thumbnail/(\d+)\.png',image.attrs['src']).group(1))
                rows.append({'narutop99_id':official_id,'genero_votante':grid.attrs['data-gender'],
                             'faixa_etaria_votante':age,'posicao':rank})
    if len(rows)!=120:
        raise ValueError(f'Expected 120 demographic rows, found {len(rows)}')
    return rows
