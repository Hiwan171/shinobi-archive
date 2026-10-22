"""Banco editorial do quiz, com respostas únicas e referências por pergunta.

As explicações são textos originais, baseados na curadoria já documentada.
O quiz é conhecimento narrativo; seus níveis não são patentes oficiais.
"""
import json, pathlib

ROOT=pathlib.Path(__file__).resolve().parents[1]
# categoria | nível | fase | revelação | personagem-fonte | pergunta | resposta | distratores | explicação
ROWS='''personagens|genin|classico|0|1344|Qual é o grande sonho de Naruto desde o começo da história?|Ser Hokage|Ser Kazekage;Liderar a Akatsuki;Ser um dos Sete Espadachins|Naruto quer ser Hokage e conquistar o reconhecimento da vila.
personagens|genin|classico|0|1344|Quem acolhe Naruto como aluno na Academia?|Iruka|Orochimaru;Madara;Sasori|O acolhimento de Iruka é um dos primeiros vínculos de confiança de Naruto.
personagens|genin|classico|0|1307|Quem é o irmão mais velho de Sasuke?|Itachi|Shisui;Obito;Neji|Itachi é o irmão que Sasuke admira na infância e depois passa a perseguir.
personagens|genin|classico|0|374|Quem treina Sakura em ninjutsu médico?|Tsunade|Kurenai;Anko;Temari|Sakura procura Tsunade para aprender medicina ninja e desenvolver seu controle de chakra.
personagens|genin|classico|0|344|Quem é o mestre que incentiva Rock Lee a nunca abandonar o próprio esforço?|Might Guy|Asuma;Kakashi;Minato|Guy orienta Lee e apoia sua dedicação ao treinamento.
personagens|chunin|classico|0|1307|Qual é o nome do pai de Sasuke?|Fugaku|Hizashi;Sakumo;Shikaku|Fugaku é o pai de Sasuke e de Itachi.
personagens|chunin|classico|0|444|Quem é o pai de Neji?|Hizashi|Hiashi;Fugaku;Sakumo|Neji é filho de Hizashi, da família secundária dos Hyūga.
personagens|chunin|classico|0|376|Quem é o pai de Kakashi?|Sakumo Hatake|Minato Namikaze;Hiruzen Sarutobi;Tobirama Senju|Sakumo é o pai cuja história marca a relação de Kakashi com o dever.
personagens|chunin|shippuden|1|1344|Quem são os pais de Naruto?|Minato e Kushina|Fugaku e Mikoto;Asuma e Kurenai;Hashirama e Mito|Minato Namikaze e Kushina Uzumaki são os pais de Naruto.
personagens|chunin|shippuden|1|259|Qual é o nome da mãe de Gaara?|Karura|Kushina;Chiyo;Mikoto|O reencontro de Gaara com seu pai revela a ligação entre Karura e a areia que o protege.
personagens|genin|boruto|0|1339|Quem é o pai de Boruto?|Naruto|Sasuke;Konohamaru;Kakashi|Boruto é filho de Naruto; a rotina do pai como Hokage afeta a convivência dos dois.
personagens|genin|boruto|0|1306|Quem são os pais de Sarada?|Sasuke e Sakura|Naruto e Hinata;Shikamaru e Temari;Asuma e Kurenai|Sarada é filha de Sasuke Uchiha e Sakura Haruno.
personagens|chunin|boruto|0|437|Quem é a irmã de Boruto?|Himawari|Sarada;Hanabi;Ino|Boruto e Himawari são os filhos de Naruto e Hinata.
personagens|chunin|classico|0|1310|Qual Uchiha mantém um laço de amizade especialmente importante com Itachi?|Shisui|Madara;Fugaku;Obito|Shisui e Itachi compartilham treinamento, confiança e preocupação com o futuro do clã.
personagens|jonin|classico|0|377|Qual é o apelido pelo qual Sakumo Hatake é conhecido?|Presa Branca|Relâmpago Amarelo;Sábio dos Seis Caminhos;Demônio da Névoa|Sakumo é conhecido como a Presa Branca de Konoha.
personagens|jonin|shippuden|1|1303|Quem entrega seu Sharingan a Kakashi após ser gravemente ferido?|Obito|Shisui;Itachi;Madara|Obito entrega seu olho a Kakashi depois de protegê-lo na missão da ponte.
tecnicas|genin|classico|0|515|Quem ensina o Rasengan a Naruto?|Jiraiya|Orochimaru;Guy;Asuma|Jiraiya orienta o treinamento de Naruto e lhe ensina o Rasengan.
tecnicas|chunin|shippuden|1|515|Quem criou o Rasengan?|Minato|Jiraiya;Kakashi;Hiruzen|Minato criou a técnica que Jiraiya depois transmite a Naruto.
tecnicas|genin|classico|0|878|O uso de qual recurso caracteriza as técnicas de Shikamaru?|Sombras|Areia;Marionetes;Argila|Shikamaru usa as sombras em conjunto com sua leitura estratégica do combate.
tecnicas|genin|classico|0|259|Qual recurso é central no estilo de combate de Gaara?|Areia|Insetos;Papel;Tinta|A areia acompanha Gaara em sua defesa e em seu combate.
tecnicas|genin|classico|0|739|Em qual especialidade Rock Lee concentra seu treinamento?|Taijutsu|Genjutsu;Ninjutsu médico;Fūinjutsu|As dificuldades com ninjutsu e genjutsu levam Lee a se especializar no combate corporal.
tecnicas|chunin|shippuden|0|193|Qual material Deidara usa para criar suas criaturas explosivas?|Argila|Areia;Madeira;Tinta|Deidara combina criaturas de argila, explosões, preparação e mobilidade.
tecnicas|chunin|shippuden|0|1042|Qual é a especialidade de Sasori?|Marionetes|Insetos;Sombras;Névoa|Sasori desenvolve seu arsenal a partir da arte das marionetes.
tecnicas|chunin|classico|0|374|Qual habilidade de Sakura favorece seu aprendizado de medicina ninja?|Controle de chakra|Manipulação de areia;Sharingan;Invocação de corvos|O controle preciso de chakra ajuda Sakura no ninjutsu médico e em seus golpes.
tecnicas|jonin|shippuden|1|1310|Qual técnica ligada a Shisui permite que Itachi rompa o controle da Reanimação?|Kotoamatsukami|Tsukuyomi Infinito;Chidori;Rasenshuriken|O Kotoamatsukami de Shisui permite que Itachi recupere sua autonomia.
tecnicas|jonin|shippuden|1|1066|A criação dos Clones das Sombras é atribuída a qual Hokage?|Tobirama|Hashirama;Hiruzen;Minato|A contribuição técnica de Tobirama inclui os Clones das Sombras.
tecnicas|jonin|shippuden|1|1066|Qual Hokage criou a técnica da Reanimação, o Edo Tensei?|Tobirama|Hashirama;Tsunade;Kakashi|A Reanimação faz parte das técnicas desenvolvidas por Tobirama.
tecnicas|jonin|shippuden|1|1066|A técnica Deus Voador do Trovão foi criada por qual Hokage?|Tobirama|Minato;Hiruzen;Naruto|Tobirama criou a técnica; isso é diferente de perguntar quem a tornou célebre depois.
tecnicas|chunin|classico|0|344|Qual técnica corporal Guy e Lee usam para ultrapassar limites físicos?|Portões Internos|Tsukuyomi Infinito;Edo Tensei;Kotoamatsukami|A abertura dos Portões Internos está ligada ao estilo de combate e ao treinamento de Guy e Lee.
tecnicas|chunin|classico|0|515|Com qual grupo de animais Jiraiya mantém vínculos de invocação?|Sapos|Cobras;Lesmas;Cães|O vínculo de Jiraiya com os sapos faz parte de sua trajetória e do treinamento de Naruto.
tecnicas|jonin|shippuden|1|1042|Que tipo de marionete vai além dos bonecos comuns no arsenal de Sasori?|Marionetes humanas|Clones de sombra;Animais de tinta;Corvos ilusórios|Sasori passa das marionetes comuns às marionetes humanas em sua busca por permanência.
tecnicas|jonin|shippuden|1|259|Segundo a revelação do pai de Gaara, o que a areia que o protege expressa?|O amor de Karura|Uma ordem de Itachi;Um pacto com Orochimaru;Uma técnica de Kakashi|A revelação reconecta a proteção da areia ao afeto de Karura por seu filho.
mundo|genin|classico|0|1344|Em qual vila Naruto cresce?|Konoha|Suna;Kiri;Iwa|A Vila da Folha, Konoha, é o centro da infância de Naruto.
mundo|genin|classico|0|259|Gaara é originário de qual vila?|Suna|Konoha;Kumo;Kiri|Gaara cresce na Vila da Areia, Suna.
mundo|genin|classico|0|376|Qual é o número da equipe formada por Naruto, Sasuke e Sakura?|Time 7|Time 8;Time 10;Time 3|Os três integram o Time 7 sob a orientação de Kakashi.
mundo|genin|classico|0|878|Quem orienta a equipe de Shikamaru, Ino e Chōji?|Asuma|Guy;Kurenai;Kakashi|Shikamaru integra o time de Asuma com Ino e Chōji.
mundo|chunin|classico|0|739|Quem são os companheiros de equipe de Rock Lee sob a liderança de Guy?|Neji e Tenten|Ino e Chōji;Hinata e Kiba;Naruto e Sakura|Lee treina e atua ao lado de Neji e Tenten no time de Guy.
mundo|chunin|shippuden|1|865|Quem são os alunos do time de Minato?|Kakashi, Obito e Rin|Naruto, Sasuke e Sakura;Ino, Shikamaru e Chōji;Lee, Neji e Tenten|Minato conduz o time de Kakashi, Obito e Rin antes de assumir a liderança de Konoha.
mundo|chunin|shippuden|1|1299|A aproximação de quais clãs permite a fundação de Konoha?|Senju e Uchiha|Hyūga e Nara;Akimichi e Yamanaka;Uzumaki e Aburame|A aliança entre Senju e Uchiha está na origem da Vila da Folha.
mundo|chunin|shippuden|1|1063|Quem é o Primeiro Hokage?|Hashirama|Tobirama;Hiruzen;Minato|Hashirama assume como Primeiro Hokage depois da fundação de Konoha.
mundo|chunin|shippuden|1|1066|Quem é o Segundo Hokage?|Tobirama|Hashirama;Hiruzen;Kakashi|Tobirama sucede Hashirama e participa da estruturação de Konoha.
mundo|chunin|shippuden|1|376|Quem assume como Sexto Hokage?|Kakashi|Tsunade;Minato;Hiruzen|Kakashi lidera Konoha no período de reconstrução após a guerra.
mundo|genin|boruto|0|1339|Na época de Boruto, qual é o número de Naruto na sucessão dos Hokage?|Sétimo|Quinto;Sexto;Quarto|Naruto é o Sétimo Hokage na fase apresentada no começo de Boruto.
mundo|chunin|shippuden|0|259|Qual título de liderança Gaara assume em Suna?|Kazekage|Hokage;Raikage;Mizukage|Gaara passa a proteger sua vila como Kazekage.
mundo|genin|boruto|0|1339|Quem integra o novo Time 7 ao lado de Boruto e Sarada?|Mitsuki|Shikadai;Inojin;Metal Lee|Boruto, Sarada e Mitsuki formam o novo Time 7.
mundo|chunin|boruto|0|1339|Quem orienta o novo Time 7 no início de Boruto?|Konohamaru|Kakashi;Asuma;Guy|Konohamaru orienta a equipe da nova geração.
mundo|jonin|shippuden|1|1066|Quem Tobirama indica como sucessor antes de servir de distração para seu time?|Hiruzen|Minato;Hashirama;Danzō|Tobirama confia a continuidade da vila a Hiruzen.
mundo|jonin|shippuden|1|1299|Com qual futuro Hokage Madara estabelece amizade antes da fundação da vila?|Hashirama|Tobirama;Hiruzen;Minato|Madara e Hashirama imaginam um futuro diferente ainda jovens, antes da fundação de Konoha.
historia|genin|classico|0|1307|Quem oferece a Sasuke uma promessa de poder que o leva a deixar Konoha?|Orochimaru|Jiraiya;Asuma;Iruka|A busca por poder aproxima Sasuke de Orochimaru, apesar dos vínculos com o Time 7.
historia|genin|classico|0|374|Qual amiga ajuda Sakura a ganhar confiança na infância?|Ino|Tenten;Temari;Rin|A amizade de Ino ajuda Sakura a enfrentar suas inseguranças.
historia|chunin|classico|0|739|Contra quem Lee demonstra sua velocidade e seus Portões no Exame Chūnin?|Gaara|Neji;Sasuke;Kiba|O confronto de Lee com Gaara revela o resultado de seu treinamento intenso.
historia|chunin|classico|0|444|Qual personagem desafia a crença de Neji de que ninguém pode mudar o próprio destino?|Naruto|Sasuke;Itachi;Orochimaru|O duelo com Naruto coloca à prova a visão de Neji sobre destino e liberdade.
historia|chunin|shippuden|1|374|Quem luta ao lado de Sakura no confronto contra Sasori?|Chiyo|Tsunade;Temari;Hinata|A parceria de Sakura e Chiyo evidencia a evolução da formação de Sakura.
historia|chunin|shippuden|1|1344|Depois de enfrentar qual adversário Naruto é reconhecido como protetor de Konoha?|Pain|Zabuza;Deidara;Sasori|Depois do confronto com Pain, o reconhecimento de Naruto pela vila muda profundamente.
historia|chunin|shippuden|1|1344|Quem ajuda Naruto a enfrentar seu conflito com a Nove-Caudas antes da guerra?|Killer B|Sasori;Danzō;Zabuza|Killer B participa da preparação de Naruto para lidar com o poder da Nove-Caudas.
historia|chunin|shippuden|1|1344|Qual é o nome da Nove-Caudas com quem Naruto constrói uma parceria?|Kurama|Shukaku;Gyūki;Isobu|O vínculo de Naruto com Kurama evolui de conflito para parceria.
historia|chunin|classico|0|259|Qual besta com cauda está selada em Gaara na infância?|Shukaku|Kurama;Gyūki;Matatabi|Gaara cresce como portador de Shukaku e enfrenta o medo dos moradores de Suna.
historia|chunin|shippuden|0|515|Qual organização Jiraiya investiga antes de seu confronto com Pain?|Akatsuki|ANBU;Raiz;Aliança Shinobi|A investigação da Akatsuki leva Jiraiya ao confronto com Pain.
historia|jonin|shippuden|1|1293|Quem se une a Sasuke para interromper a Reanimação durante a guerra?|Itachi|Shisui;Deidara;Sakumo|Depois de recuperar a autonomia, Itachi se une a Sasuke para interromper a técnica.
historia|jonin|shippuden|1|1299|Qual é o nome do plano de Madara para impor um mundo de sonhos?|Tsukuyomi Infinito|Plano Olho de Corvo;Operação Ponte Tenchi;Exame Chūnin|Madara busca realizar o Tsukuyomi Infinito como uma paz imposta por meio da ilusão.
historia|jonin|shippuden|1|344|Diante de qual adversário Guy leva os Portões Internos ao limite na guerra?|Madara|Orochimaru;Sasori;Kisame|Guy recorre aos Oito Portões diante de Madara para proteger seus aliados.
historia|jonin|shippuden|1|377|Após qual confronto Kakashi consegue conversar com Sakumo sobre o passado?|A batalha contra Pain|A luta de Lee contra Gaara;O duelo de Sasuke com Deidara;O Exame de Naruto na Academia|O reencontro acontece depois da batalha contra Pain e permite um entendimento entre pai e filho.
historia|chunin|boruto|0|1306|Qual líder inspira o objetivo de liderança de Sarada?|Naruto|Orochimaru;Danzō;Sasori|A admiração de Sarada por Naruto ajuda a dar direção a seu próprio sonho.
historia|jonin|boruto|0|1339|Quem é o mestre de Boruto que foi rival de Naruto no antigo Time 7?|Sasuke|Sakura;Kakashi;Sai|Sasuke, antigo companheiro e rival de Naruto no Time 7, passa a orientar Boruto na nova geração.'''

def main():
    history=json.loads((ROOT/'data/editorial/historia_personagem.json').read_text(encoding='utf-8'))
    refs={}
    for row in history:refs.setdefault(row['personagem_id'],row['url_fonte'])
    questions=[]
    for i,line in enumerate(ROWS.splitlines(),1):
        cat,level,era,spoiler,person,question,answer,wrong,explanation=line.split('|')
        choices=[answer,*wrong.split(';')]
        assert len(choices)==len(set(choices))==4
        source='https://naruto-official.com/en/news/01_1904' if int(person)==376 and era=='shippuden' else refs[int(person)]
        questions.append({'id':f'qs-{i:03}','category':cat,'difficulty':level,'era':era,'spoiler':spoiler=='1','person':int(person),'question':question,'options':choices,'answer':0,'explanation':explanation,'source':source})
    assert len(questions)==64
    assert len({q['question'] for q in questions})==len(questions)
    bank={'version':1,'title':'Exame Shinobi','editorial':'Perguntas e explicações originais em português; referências oficiais da curadoria do acervo.','questions':questions}
    target=ROOT/'data/editorial/quiz_shinobi.json'
    target.write_text(json.dumps(bank,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'questions':len(questions),'categories':4,'difficulties':3,'eras':3,'withoutSpoilers':sum(not q['spoiler'] for q in questions)}))

if __name__=='__main__':main()
