# Publicando este projeto na Vercel

Este projeto usa:

- React 18
- TypeScript
- Vite
- `json-server` local em portas separadas

Os scripts principais do projeto são:

```bash
npm run dev
npm run build
npm run lint
npm run test
npm run start:servers
```

## Resumo importante antes de publicar

O frontend pode ser publicado na Vercel sem dificuldade, porque o build gera arquivos estáticos na pasta `dist`.

Mas existe um detalhe importante neste repositório: ele depende de APIs locais com `json-server` nestes endereços:

- `http://localhost:5001`
- `http://localhost:5002`
- `http://localhost:5003`

Isso significa que:

- a Vercel publica muito bem o frontend
- a Vercel não vai manter esses `json-server` rodando da mesma forma que no seu computador
- no deploy, as leituras podem até cair em dados locais de fallback em alguns casos
- já operações de criar, editar, excluir e autenticar via API podem falhar se você não publicar um backend separado

Se o seu objetivo for:

- **só mostrar a interface online**, a publicação do frontend já resolve
- **ter o sistema completo funcionando online**, você vai precisar mover essas APIs para outro serviço

## Passo a passo detalhado para publicar na Vercel

### 1. Garanta que o projeto funciona localmente

No terminal, dentro da pasta do projeto, rode:

```bash
npm install
npm run build
```

Se quiser testar o projeto local completo com frontend + servidores JSON:

```bash
npm run start:servers
```

Esse comando sobe:

- frontend Vite
- base de tarefas
- base de tarefas diárias
- base de autenticação
- base de perfis de usuário

## 2. Suba o projeto para um repositório Git

A forma mais simples de publicar na Vercel é conectando um repositório GitHub.

Se o projeto ainda não estiver no GitHub:

1. Crie um repositório no GitHub
2. Envie este projeto para lá
3. Confirme que a branch principal está atualizada

Se ele já estiver no GitHub, pode seguir para o próximo passo.

## 3. Entre na sua conta da Vercel

Abra:

`https://vercel.com/rinogahrs-projects`

Depois:

1. faça login na conta correta
2. confira se você está no workspace certo
3. clique em **Add New**
4. clique em **Project**

## 4. Importe o repositório

Na tela de importação:

1. escolha o provedor Git, normalmente **GitHub**
2. autorize a Vercel, se ela pedir permissão
3. procure o repositório deste projeto
4. clique em **Import**

## 5. Configure o projeto na tela da Vercel

Como este projeto usa Vite, a configuração esperada normalmente é:

- **Framework Preset**: `Vite`
- **Root Directory**: `.`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Na maioria dos casos, a Vercel já detecta isso automaticamente. Mesmo assim, vale conferir antes de publicar.

## 6. Revise variáveis de ambiente

Hoje este projeto não usa variáveis `VITE_...` configuradas no código.

Então, em princípio, você pode publicar sem preencher variáveis de ambiente.

Mas existe um ponto importante:

- hoje as URLs de API estão fixas como `localhost`
- isso funciona localmente
- isso não funciona em produção

Se no futuro você publicar um backend real, será melhor trocar essas URLs fixas por variáveis de ambiente, por exemplo:

```env
VITE_TAREFAS_API_URL=https://seu-backend.com
VITE_AUTH_API_URL=https://seu-backend.com
VITE_USUARIOS_API_URL=https://seu-backend.com
```

## 7. Clique em Deploy

Depois de revisar tudo:

1. clique em **Deploy**
2. aguarde a Vercel instalar as dependências
3. aguarde o build finalizar
4. abra a URL gerada

A URL publicada ficará parecida com:

```text
https://nome-do-projeto.vercel.app
```

## 8. Teste o que realmente funciona no deploy

Depois da publicação, valide estes pontos:

1. a tela inicial abre normalmente
2. navegação entre páginas funciona
3. atualização da página em rotas internas funciona ou retorna erro
4. login funciona
5. criação e edição de tarefas funciona
6. criação e edição de usuários funciona

## Limitações atuais deste projeto na Vercel

Hoje o projeto possui chamadas para APIs locais dentro do frontend. Exemplos:

- tarefas: porta `5001`
- autenticação: porta `5002`
- perfis de usuário: porta `5003`

Por causa disso, ao publicar somente o frontend:

- a interface pode abrir
- algumas listas podem aparecer usando fallback local
- ações que dependem de `POST`, `PATCH`, `PUT` e `DELETE` não devem funcionar corretamente

## Problema comum: rota dá 404 ao atualizar a página

Este projeto usa navegação com `react-router-dom` no navegador. Em projetos SPA publicados na Vercel, é comum acontecer o seguinte:

- você entra pela URL principal e funciona
- mas ao atualizar uma rota como `/home` ou `/home/users`, aparece 404

Se isso acontecer, normalmente é necessário adicionar um arquivo `vercel.json` com rewrite para a aplicação:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Sem esse ajuste, rotas internas podem falhar ao recarregar a página diretamente.

## Melhor caminho para publicar este projeto de verdade

Você tem 2 opções práticas:

### Opção 1. Publicar só o frontend

Use essa opção se você quer:

- mostrar o layout
- compartilhar a interface
- demonstrar navegação e estrutura visual

Nesse cenário, a Vercel já atende bem.

### Opção 2. Publicar frontend + backend separado

Use essa opção se você quer:

- login funcionando online
- cadastro de usuário funcionando
- criação e edição de tarefas persistindo
- exclusão e atualização de dados funcionando de verdade

Nesse cenário, o ideal é:

1. publicar o frontend na Vercel
2. publicar a API em outro serviço
3. atualizar o frontend para consumir a URL pública dessa API

Serviços comuns para backend:

- Render
- Railway
- Supabase
- Firebase
- Neon com API própria

## Publicação rápida pela CLI da Vercel

Se preferir fazer pelo terminal:

```bash
npm install -g vercel
vercel
```

Depois:

1. faça login
2. escolha o escopo correto
3. confirme a pasta do projeto
4. confirme as configurações sugeridas
5. finalize o deploy

Para produção:

```bash
vercel --prod
```

## Checklist final

Antes de considerar a publicação concluída, confirme:

- o repositório está atualizado no GitHub
- a Vercel detectou `Vite`
- o comando de build é `npm run build`
- a pasta de saída é `dist`
- a aplicação abre pela URL pública
- você entendeu que as APIs `localhost` não funcionarão em produção
- se houver 404 em rotas internas, adicione o rewrite com `vercel.json`

## Conclusão

Hoje, você consegue publicar este projeto na Vercel para disponibilizar o frontend online.

Se quiser o sistema totalmente funcional em produção, o próximo passo é separar e publicar o backend também, porque os `json-server` locais não funcionam na Vercel como funcionam na sua máquina.

