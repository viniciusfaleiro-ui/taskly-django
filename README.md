# Taskly — Todo API

Aplicação Django REST Framework para gerenciar tarefas pessoais, com autenticação por Token e isolamento das tarefas por usuário.

## Rodar localmente

```powershell
.\.venv\Scripts\Activate.ps1
python manage.py migrate
python manage.py runserver
```

Acesse `http://127.0.0.1:8000/`.

## Endpoints

- `POST /api/login/` — login e token.
- `GET/POST /api/tarefas/` — listar ou criar tarefas do usuário autenticado.
- `GET/PATCH/PUT/DELETE /api/tarefas/<id>/` — operar uma tarefa própria.
- Filtros: `?concluida=true|false` e `?prioridade=ALTA|MEDIA|BAIXA`.

## Documentacao e deploy

## Objetivo do projeto

O Taskly foi desenvolvido como um exercicio de desenvolvimento web com foco em uma API REST para gerenciamento de tarefas pessoais. A aplicacao possui uma interface acessivel pelo navegador e endpoints que podem ser consumidos por outros clientes, como aplicativos moveis.

O requisito central e o controle de acesso: cada usuario autenticado deve visualizar e modificar somente as suas proprias tarefas. Essa regra e aplicada no servidor, e nao apenas na interface visual.

## Como utilizar a aplicacao

1. Acesse a pagina inicial em `http://127.0.0.1:8000/`.
2. Informe um usuario e uma senha validos.
3. Crie uma tarefa preenchendo titulo, descricao opcional, prioridade e prazo.
4. Use o circulo ao lado da tarefa para marca-la como concluida.
5. Utilize **Editar** e **Excluir** para gerenciar cada registro.
6. Use a busca para localizar palavras no titulo ou na descricao.
7. Use os filtros para exibir tarefas pendentes, concluidas ou de uma prioridade especifica.
8. Selecione um tema no menu superior. A preferencia fica salva no navegador.

## Conceitos implementados

- `ModelSerializer`: converte objetos `Tarefa` em JSON e valida os dados recebidos.
- `ListCreateAPIView`: lista e cria tarefas.
- `RetrieveUpdateDestroyAPIView`: consulta, edita e exclui uma tarefa especifica.
- `get_queryset()`: restringe resultados ao usuario autenticado e aplica filtros.
- `perform_create()`: define automaticamente o proprietario da nova tarefa.
- `read_only`: impede que o cliente escolha o campo `usuario`.
- `PATCH`: permite atualizacoes parciais, como marcar uma tarefa como concluida.
- `PUT`: representa a atualizacao completa de um recurso.

## Consumo da API

O login e realizado em `POST /api/login/`:

```json
{
  "username": "Azazel",
  "password": "sua-senha"
}
```

A resposta fornece um token. Nas requisicoes seguintes, envie-o no cabecalho:

```http
Authorization: Token SEU_TOKEN
```

Principais rotas:

| Metodo | Rota | Finalidade |
|---|---|---|
| POST | `/api/login/` | Autenticar o usuario |
| GET | `/api/tarefas/` | Listar tarefas do usuario |
| POST | `/api/tarefas/` | Criar uma tarefa |
| GET | `/api/tarefas/<id>/` | Consultar uma tarefa |
| PUT/PATCH | `/api/tarefas/<id>/` | Atualizar uma tarefa |
| DELETE | `/api/tarefas/<id>/` | Excluir uma tarefa |

Filtros disponiveis:

- `/api/tarefas/?concluida=true`
- `/api/tarefas/?concluida=false`
- `/api/tarefas/?prioridade=ALTA`
- `/api/tarefas/?prioridade=MEDIA`
- `/api/tarefas/?prioridade=BAIXA`

## Respostas de seguranca

- Sem token de autenticacao, a API responde `401 Unauthorized`.
- Uma tarefa pertencente a outro usuario nao aparece na listagem.
- O acesso ao ID de uma tarefa de outra pessoa resulta em `404 Not Found`.
- O campo `usuario` e somente leitura e definido pelo servidor.

## Administracao

Para criar um administrador local:

```powershell
python manage.py createsuperuser
```

A area administrativa pode ser acessada em `http://127.0.0.1:8000/admin/`. Ela permite consultar usuarios e tarefas, pesquisar registros e filtrar tarefas por situacao e prioridade.

## Publicacao

Para permitir o acesso pelo celular e compartilhar o projeto, uma arquitetura adequada e:

- GitHub para armazenar o codigo-fonte;
- Render para executar a aplicacao Django;
- Supabase para fornecer o banco PostgreSQL.

No ambiente de producao, configure `DATABASE_URL` com a connection string do Supabase e mantenha `DJANGO_DEBUG=False`. A chave secreta e a senha do banco devem ser cadastradas como variaveis privadas no servico de hospedagem, nunca diretamente no codigo ou em um repositorio publico.

## Verificacao do projeto

Antes do envio, execute:

```powershell
python manage.py check
python manage.py migrate
python manage.py collectstatic --no-input
```

Esses comandos verificam a configuracao, aplicam as migracoes do banco e preparam os arquivos estaticos para a publicacao.

O arquivo `render.yaml` já configura Gunicorn, arquivos estáticos e migrações. No Render, conecte este repositório GitHub e informe a variável `DATABASE_URL` usando a connection string do Supabase. O banco local `db.sqlite3` não é usado em produção quando `DATABASE_URL` está definida.
