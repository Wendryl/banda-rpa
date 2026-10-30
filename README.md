# Banda RPA — Site

Site estático da Banda RPA (Reunidos Para Adorar), construído com [Eleventy] (11ty).

## Estrutura

```
src/
├── _data/            # Conteúdo editável
│   ├── site-config.json # Título, links, redes sociais e botões de músicas
│   ├── icons.json    # Definições SVG dos ícones (não editável pelo CMS)
│   ├── site.js       # Junta site-config.json + icons.json em `site`
│   ├── agenda.json   # Datas de shows (lista `shows`)
│   ├── gallery-manifest.json  # Fotos da galeria (ordem e exclusões)
│   ├── gallery.js    # Lê a lista de src/_data/gallery-manifest.json
│   ├── videos-manifest.json   # Vídeos da banda (ordem e exclusões)
│   └── videos.js     # Lê a lista de src/_data/videos-manifest.json
├── _includes/
│   ├── layouts/base.njk  # Layout principal (head, nav, footer, lightbox)
│   └── partials/         # Partials: nav, footer, head, svg
├── admin/            # ⬅️ Painel do CMS (index.html + config.yml)
├── gallery/          # ⬅️ Fotos da galeria — basta adicionar arquivos aqui
├── videos/           # ⬅️ Vídeos enviados pelo CMS (MP4/WebM)
├── index.njk         # Página inicial
└── gallery.njk       # Página da galeria
```

## Comandos

| Comando             | O que faz                              |
| ------------------- | -------------------------------------- |
| `npm start`         | Servidor local com recarregamento automático |
| `npm run build`     | Gera o site estático na pasta `_site/` |
| `npm run clean`     | Remove a pasta `_site/`                |
| `npm run cms`       | Inicia o proxy local do Decap CMS      |

## CMS (Decap CMS)

O painel do CMS fica em **`/admin`** (`.html` do site publicado). Ele edita os
arquivos de conteúdo direto no repositório.

### Testar localmente

1. Terminal 1: `npm start` → site em `http://localhost:8080`
2. Terminal 2: `npm run cms` → proxy do CMS em `http://localhost:8081`
3. Abra `http://localhost:8080/admin/` e faça login (local, sem autenticação).

Como `local_backend: true`, no `localhost` o CMS usa o `decap-server` em vez do
proxy de OAuth — isso evita o erro `Invalid origin: http://localhost:8080`. Pode
deixar essa opção versionada: ela só tem efeito em `localhost`.

Em produção (GitHub Pages), a autenticação GitHub já está configurada pelo proxy
de OAuth em `https://decap-cms-proxy.onrender.com`, definido em
`src/admin/config.yml` (`base_url` + `auth_endpoint`). Garanta que o proxy permita
a origem do site publicado (ex.: o domínio do GitHub Pages ou o domínio customizado)
para que o login funcione.

### O que o CMS edita

**Galeria**, **Vídeos** e **Shows** (agenda):

- **Shows** → `src/_data/agenda.json` — criar, editar e remover shows (CRUD).
- **Galeria** → `src/_data/gallery-manifest.json` + `src/gallery/`:
  - *Enviar novas fotos* → botão de mídia (upload para `src/gallery/`).
  - *Excluir/ocultar uma foto* → remover o item da lista (o arquivo permanece em `src/gallery/`).
  - *Adicionar* → a nova foto entra no topo da lista.
  - *Reordenar* → arrastar os itens na lista.
- **Vídeos** → `src/_data/videos-manifest.json` + `src/videos/`:
  - *Enviar vídeos* → upload direto do arquivo (MP4 recomendado) para `src/videos/`.
  - *Pôster* → imagem opcional exibida antes da reprodução.
  - *Excluir/reordenar* → igual à galeria. Arquivos ficam versionados no Git.

## Como adicionar conteúdo

> Dica: a forma recomendada é pelo **CMS** (`/admin`). Editar os JSONs à mão é equivalente.

### Fotos na galeria
Em `src/_data/gallery-manifest.json`, use a lista `photos` (a ordem da lista é a ordem
exibida no site; itens fora da lista ficam ocultos). Pelo CMS, novas fotos são
adicionadas no topo da lista e aparecem primeiro no site:

```json
{
  "photos": [{ "file": "gallery-01.jpeg" }, { "file": "gallery-02.jpeg" }]
}
```

O `file` aponta para o arquivo em `src/gallery/`. Se a lista estiver vazia, o
site mostra todas as fotos da pasta em ordem numérica (fallback).

### Vídeos
Em `src/_data/videos-manifest.json`, use a lista `videos` (a ordem da lista é a
ordem exibida no site). O `file` aponta para o arquivo em `src/videos/`:

```json
{
  "videos": [
    {
      "file": "show-2026.mp4",
      "title": "Apresentação em Pindamonhangaba",
      "poster": "show-2026-poster.jpg"
    }
  ]
}
```

> ⚠️ Vídeos são arquivos grandes e ficam no Git para sempre. Prefira clipes curtos
> e compactados (MP4/H.264). O GitHub rejeita arquivos acima de ~100 MB. Para
> apresentações longas, o ideal continua sendo YouTube/Vimeo.

### Novos shows na agenda
Em `src/_data/agenda.json`, adicione um objeto por show na lista `shows`:

```json
{
  "shows": [
    {
      "date": "2026-10-31",
      "city": "Pindamonhangaba",
      "venue": "Assembleia de Deus Min. Araretama - Pindamonhangaba/SP"
    },
    {
      "date": "2026-11-15",
      "city": "Sua Cidade",
      "venue": "Nome do Local"
    }
  ]
}
```

### Redes sociais, ícones e links
Tudo fica em `src/_data/site-config.json`:
- `links` — URLs (YouTube, WhatsApp, Instagram).
- `social` — ícones no topo da página inicial (adicione/remova itens).
- `musicas` — botões da seção "Músicas".
- `icons` — definições dos SVGs usados acima.

## Deploy (GitHub Pages)

Ao fazer push para `main`/`master`, o workflow `.github/workflows/deploy.yml`:
1. instala as dependências com `npm ci`,
2. roda `npm run build`,
3. publica o conteúdo de `_site/` no GitHub Pages.

## Dependências

- [Eleventy] — gerador de site estático
- [Decap CMS] — painel de conteúdo em `/admin` (proxy local via `decap-server`)
- [GLightbox] — lightbox da galeria (carregado via CDN)
- Tailwind CSS (via CDN, sem etapa de build)

[Eleventy]: https://www.11ty.dev/
[Decap CMS]: https://decapcms.org/
[GLightbox]: https://biati-digital.github.io/glightbox/