# Documentação do json-server

## Base URLs

- `http://localhost:5000` para `data/tarefazBd.json`
- `http://localhost:5001` para `data/tarefasDiarias.json`

## Recurso `tarefasDiarias`

### GET `/tarefasDiarias`

- Retorna a lista de tarefas em JSON.
- Sem parâmetros obrigatórios.

### GET `/tarefasDiarias/:id`

- Retorna uma tarefa específica pelo `id`.
- Parâmetros:
  - `id` (number): identificador da tarefa.

### POST `/tarefasDiarias`

- Cria uma nova tarefa.
- Body JSON esperado:

```json
{
  "usuario": [
    {
      "id": 1,
      "name": "Nome do usuário",
      "dados": "Informações do usuário",
      "photpth": "src/assets/avatar/avatar.jpg"
    }
  ],
  "titulo": "Título da tarefa",
  "descricao": "Descrição da tarefa",
  "dataInicio": "2026-03-23T08:00:00",
  "dataFim": "2026-03-23T09:00:00",
  "feito": false
}
```

### PUT `/tarefasDiarias/:id`

- Atualiza uma tarefa existente pelo `id`.
- Parâmetros:
  - `id` (number): identificador da tarefa.
- Body JSON esperado:
  - Qualquer subconjunto válido dos campos de tarefa.

### DELETE `/tarefasDiarias/:id`

- Remove uma tarefa existente pelo `id`.
- Parâmetros:
  - `id` (number): identificador da tarefa.

## Recurso `tarefazBd`

### GET `/tarefazBd`

- Retorna os registros em JSON.
- Sem parâmetros obrigatórios.

### GET `/tarefazBd/:id`

- Retorna um registro específico pelo `id`.
- Parâmetros:
  - `id` (number): identificador do registro.

### POST `/tarefazBd`

- Cria um novo registro.
- Body JSON esperado:
  - Objeto JSON válido com os campos do domínio.

### PUT `/tarefazBd/:id`

- Atualiza um registro existente pelo `id`.
- Parâmetros:
  - `id` (number): identificador do registro.

### DELETE `/tarefazBd/:id`

- Remove um registro existente pelo `id`.
- Parâmetros:
  - `id` (number): identificador do registro.
