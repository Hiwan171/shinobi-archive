// Cole como consulta em branco, no Editor Avançado, e nomeie fnCarregarTabela.
// A raiz opcional permite mover o projeto sem editar a função.
(NomeTabela as text, optional PastaProjeto as nullable text) as table =>
let
    Raiz = if PastaProjeto = null then "C:\Users\User\Desktop\BI\BI MCP" else PastaProjeto,
    Esquema = Json.Document(File.Contents(Raiz & "\data\processed\schema.json")),
    Colunas = Record.Field(Record.Field(Esquema, NomeTabela), "columns"),
    Fonte = Csv.Document(
        File.Contents(Raiz & "\data\processed\csv\" & NomeTabela & ".csv"),
        [Delimiter = ";", Encoding = 65001, QuoteStyle = QuoteStyle.Csv]
    ),
    Cabecalhos = Table.PromoteHeaders(Fonte, [PromoteAllScalars = true]),
    Vazios = Table.ReplaceValue(Cabecalhos, "", null, Replacer.ReplaceValue, Table.ColumnNames(Cabecalhos)),
    Tipos = List.Transform(Record.FieldNames(Colunas), (Coluna) => {
        Coluna,
        if Record.Field(Colunas, Coluna) = "integer" then Int64.Type
        else if Record.Field(Colunas, Coluna) = "number" then type number
        else if Record.Field(Colunas, Coluna) = "boolean" then type logical
        else type text
    }),
    Resultado = Table.TransformColumnTypes(Vazios, Tipos, "en-US")
in
    Resultado
