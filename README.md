# Mamanuh Boutique — site de demonstração

Vitrine com catálogo e atendimento pelo WhatsApp para a Mamanuh Boutique (Itajaí, SC).
**Proposta de demonstração**: imagens de referência e dados de cadastro público aguardam aprovação da boutique.

Site estático, sem build, sem cookies e sem rastreamento. Para rodar localmente:

```sh
python3 -m http.server 8000   # depois abra http://localhost:8000
```

## Estrutura

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Estrutura das seções, SEO e dados estruturados |
| `js/config.js` | **Tudo o que a boutique atualiza**: contatos, coleções, peças, looks, FAQ, mensagens |
| `js/main.js` | Montagem das seções, filtros, painéis de detalhe, menu, WhatsApp |
| `js/map.js` | Mapa da seção "Visite a loja", com a foto da fachada como marcador |
| `assets/vendor/leaflet/` | Leaflet 1.9.4 (licença BSD-2), servido pelo próprio site |
| `js/motion.js` | Efeitos de movimento (decorativos; o site funciona sem eles) |
| `css/styles.css` | Tokens e estilos (design system adaptado) |
| `assets/img/` | Fotos em WebP, duas larguras (`-480`, `-900`) |
| `assets/fonts/` | Italiana e Poppins (licença OFL) |

## Atualizar o catálogo

1. Exporte cada foto como `assets/img/<nome>-480.webp` e `assets/img/<nome>-900.webp`.
2. Em `js/config.js`, adicione a peça em `products` (`id`, `ref`, `name`, `category`, `description`, `images`).
3. Preencha `price`, `colors`, `sizes` e `composition` somente com dados confirmados; vazios aparecem como "A confirmar com a boutique".
4. Remova `illustrative: true` das imagens autorizadas.
5. Os filtros por categoria aparecem sozinhos quando houver pelo menos 6 peças e 2 categorias (`filters`).

## Contatos

- `contact.whatsapp`: número confirmado, só dígitos com DDI (`5547…`). Enquanto `null`, os botões de consulta abrem uma prévia da mensagem em vez de um link.
- `contact.instagram`: URL do perfil oficial. Enquanto `null`, nenhum link é criado e a pendência é sinalizada.
- `contact.hours`, `contact.mapsUrl`, `about.paragraphs`, `faq[].answer`: preencher após aprovação.
- `demo: false` remove a faixa de demonstração e as etiquetas "A confirmar".

## Movimento

- Títulos que sobem palavra por palavra, fotos reveladas em "cortina" e fio dos cabeçalhos que se desenha.
- Parallax leve das fotos durante a rolagem, sem controlar a rolagem.
- Cabeçalho que se recolhe ao descer e volta ao subir, com barra de progresso.
- Com mouse: fotos da abertura reagem ao ponteiro, cursor "Ver peça", botões magnéticos e zoom na foto dos detalhes.
- Looks: ao apontar ou focar uma peça na lista, a foto aproxima essa peça (`position` da imagem da peça).
- Filtros com transição e entrada em sequência das peças.
- Nenhuma animação contínua. Com "reduzir movimento" ativo no sistema, tudo aparece no estado final.

## Mapa

- Leaflet com o mapa claro do OpenStreetMap/CARTO; só carrega quando a seção de visita se aproxima da tela.
- O marcador é a foto da fachada; ao clicar, abre um cartão com a foto, o endereço e "Como chegar".
- A rolagem do mouse nunca dá zoom no mapa, e no celular o dedo continua rolando a página (zoom pelos botões + e −).
- Se o mapa não carregar, a foto da fachada fica no lugar.
- Coordenadas em `contact.map`. As atuais são do complexo Bistek São João (Rua Heitor Liberato, 1550); com `confirmed: false`, o mapa mostra "Localização aproximada".

## Design system

Os fundamentos vêm do design system de referência (Orluxe): Italiana nos títulos (peso 400, seções em caixa alta com fio de 1px abaixo), Poppins no texto, cantos retos, fios em vez de sombras, botões em caixa alta, base de espaçamento de 4px e anel de foco sólido.
O vinho da Orluxe é a cor de marca de outra empresa, então foi trocado por grafite (`#2b2a28`) sobre off-white (`#faf8f4`), como pede o briefing.

## Antes de publicar

- [x] Grafia oficial do nome: "Mamanuh Boutique" (letreiro da fachada)
- [ ] Identidade visual: logotipo (`brand.logo`) e cores aprovadas
- [ ] Fotos autorizadas: peças, looks, loja ou equipe (fachada já recebida)
- [ ] Catálogo real: categorias, peças, referências, cores, tamanhos, composição e preços (se forem divulgados)
- [ ] Looks aprovados pela loja
- [x] Perfil oficial do Instagram: https://www.instagram.com/mamanuhboutique/
- [x] WhatsApp: (47) 93380-4112
- [ ] Ponto exato da loja no mapa (`contact.map`), depois `confirmed: true`
- [ ] Endereço validado (Rua Heitor Liberato, 1550, loja 35, São João, Itajaí) e CEP; link oficial do Google Maps
- [ ] Horários de funcionamento
- [ ] Respostas das perguntas frequentes: provador, entrega/retirada, pagamento, trocas
- [ ] Texto "Sobre" e posicionamento da loja
- [ ] Remover `noindex` e conferir JSON-LD em `index.html`; definir domínio e imagem de compartilhamento
