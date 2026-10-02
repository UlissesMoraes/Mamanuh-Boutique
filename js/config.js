/*
 * Configuração central do site da Mamanuh Boutique.
 *
 * Tudo o que a boutique precisa atualizar fica aqui: contatos, coleções,
 * peças, looks e perguntas frequentes. Nenhum outro arquivo precisa mudar
 * para atualizar o catálogo.
 *
 * Regras da demonstração:
 * - `null` significa "pendente de confirmação". O site sinaliza a pendência
 *   e não cria links nem botões fictícios para esses campos.
 * - `confirmed: false` mantém a etiqueta "A confirmar" ao lado do dado.
 * - Preço, cores, tamanhos e composição só aparecem quando preenchidos.
 *   Nunca preencha com valores estimados.
 * - `illustrative: true` em uma imagem exibe a etiqueta "Imagem de referência".
 */
window.SITE = {
  /* Exibe a faixa "Proposta de demonstração" e as etiquetas de pendência. */
  demo: true,

  brand: {
    name: "Mamanuh Boutique",
    shortName: "Mamanuh",
    /* O cadastro público registra "Mamanuh Botique". Confirmar a grafia oficial. */
    /* Grafia conferida no letreiro da fachada: "Mamanuh Boutique". */
    nameConfirmed: true,
    legalName: "Dandi Comércio de Vestuário e Acessórios Ltda.",
    segment: "Roupas e acessórios",
    /* Arquivo do logotipo aprovado (ex.: "assets/img/logo.svg"). Sem logo, o nome é escrito em texto. */
    logo: null
  },

  contact: {
    /* Somente número confirmado para WhatsApp, com DDI e DDD, só dígitos. Ex.: "5547999999999". */
    whatsapp: "5547933804112",
    whatsappDisplay: "(47) 93380-4112",
    /* Telefone fixo do cadastro público. Não presumir que recebe WhatsApp. */
    phone: { display: "(47) 3380-4112", tel: "+554733804112", confirmed: false },
    /* Endereço completo do perfil oficial. Ex.: "https://www.instagram.com/usuario/". */
    instagram: "https://www.instagram.com/mamanuhboutique/",
    address: {
      street: "Rua Heitor Liberato, 1550, loja 35",
      district: "São João",
      city: "Itajaí",
      state: "SC",
      postalCode: null,
      confirmed: false
    },
    /* Lista de horários confirmados. Ex.: [{ days: "Segunda a sexta", time: "9h às 19h" }] */
    hours: null,
    /*
     * Ponto do mapa. As coordenadas atuais são do complexo Bistek São João
     * (Rua Heitor Liberato, 1550), não da loja 35 em si: por isso
     * `confirmed: false` mantém o aviso "Localização aproximada".
     */
    map: {
      lat: -26.9063432,
      lng: -48.672717,
      zoom: 17,
      /* Texto buscado no Google Maps para centralizar o mapa. */
      query: "Rua Heitor Liberato, 1550 - São João, Itajaí - SC",
      confirmed: false,
      /* Foto usada como marcador (arquivo em assets/img, sem o sufixo -480/-900). */
      photo: "fachada",
      photoAlt: "Fachada da Mamanuh Boutique"
    },
    /* Link de localização aprovado (ex.: perfil da loja no Google Maps). Sem ele, usa busca pelo endereço. */
    mapsUrl: null
  },

  messages: {
    general: "Olá! Gostaria de conhecer as peças da Mamanuh Boutique.",
    product: "Olá! Gostaria de consultar preço, tamanhos e disponibilidade da peça {item}.",
    look: "Olá! Gostaria de saber mais sobre o look {item}."
  },

  /* Coleções em destaque. A primeira recebe maior destaque. `filter` liga a coleção a uma categoria do catálogo. */
  collections: [
    {
      id: "vestidos",
      name: "Vestidos",
      description: "Modelos longos e midi para ocasiões diferentes.",
      filter: "Vestidos",
      image: { file: "look-vestido-estampado", alt: "Vestido longo estampado em tons de off-white, marinho e caramelo", position: "50% 35%", illustrative: true },
      confirmed: false
    },
    {
      id: "saias-calcas",
      name: "Saias e calças",
      description: "Peças de base para montar combinações.",
      filter: "Saias e calças",
      image: { file: "look-saia-paete", alt: "Saia midi preta com brilho usada com camiseta branca", position: "50% 75%", illustrative: true },
      confirmed: false
    },
    {
      id: "blusas-tops",
      name: "Blusas e tops",
      description: "Do casual ao noturno.",
      filter: "Blusas e tops",
      image: { file: "look-corset-cargo", alt: "Top corset preto sem alças usado com calça preta", position: "50% 32%", illustrative: true },
      confirmed: false
    }
  ],

  /*
   * Peças do catálogo. Campos opcionais: price (texto já formatado, ex.: "R$ 389,00"),
   * colors, sizes, composition (listas ou texto) e images (fotos adicionais).
   */
  products: [
    {
      id: "vestido-longo-alcas",
      ref: "REF-001",
      name: "Vestido longo de alças",
      category: "Vestidos",
      description: "Decote em V com amarração no busto e saia em camadas.",
      price: null, colors: null, sizes: null, composition: null,
      images: [{ file: "vestido-longo-off-white", alt: "Vestido longo claro de alças com amarração no busto e saia em camadas", position: "50% 35%", illustrative: true }]
    },
    {
      id: "vestido-midi-tule",
      ref: "REF-002",
      name: "Vestido midi em tule estampado",
      category: "Vestidos",
      description: "Manga longa, modelagem ajustada e estampa animal print.",
      price: null, colors: null, sizes: null, composition: null,
      images: [{ file: "vestido-midi-animal-print", alt: "Vestido midi de manga longa com estampa animal print, visto de costas", position: "50% 45%", illustrative: true }]
    },
    {
      id: "saia-midi-brilho",
      ref: "REF-003",
      name: "Saia midi com brilho",
      category: "Saias e calças",
      description: "Saia reta com aplicação de brilho e franzido na lateral.",
      price: null, colors: null, sizes: null, composition: null,
      images: [{ file: "look-saia-paete", alt: "Saia midi preta com brilho", position: "50% 78%", illustrative: true }]
    },
    {
      id: "camiseta-oversized",
      ref: "REF-004",
      name: "Camiseta oversized estampada",
      category: "Blusas e tops",
      description: "Modelagem ampla com estampa tipográfica.",
      price: null, colors: null, sizes: null, composition: null,
      images: [{ file: "look-saia-paete", alt: "Camiseta branca oversized com estampa tipográfica", position: "50% 22%", illustrative: true }]
    },
    {
      id: "vestido-longo-estampado",
      ref: "REF-005",
      name: "Vestido longo estampado",
      category: "Vestidos",
      description: "Ombros vazados, mangas amplas e estampa em pinceladas.",
      price: null, colors: null, sizes: null, composition: null,
      images: [{ file: "look-vestido-estampado", alt: "Vestido longo estampado em tons de off-white, marinho e caramelo com ombros vazados", position: "50% 40%", illustrative: true }]
    },
    {
      id: "top-corset",
      ref: "REF-006",
      name: "Top corset",
      category: "Blusas e tops",
      description: "Sem alças, com botões frontais e acabamento brilhante.",
      price: null, colors: null, sizes: null, composition: null,
      images: [{ file: "look-corset-cargo", alt: "Top corset preto sem alças com botões frontais", position: "50% 30%", illustrative: true }]
    },
    {
      id: "calca-cargo",
      ref: "REF-007",
      name: "Calça cargo",
      category: "Saias e calças",
      description: "Pernas amplas e bolsos laterais.",
      price: null, colors: null, sizes: null, composition: null,
      images: [{ file: "look-corset-cargo", alt: "Calça cargo preta de pernas amplas", position: "50% 80%", illustrative: true }]
    }
  ],

  /* Looks: combinações aprovadas pela loja. `items` lista os ids das peças usadas. */
  looks: [
    {
      id: "look-brilho-casual",
      ref: "LOOK-01",
      name: "Brilho com camiseta",
      description: "Saia midi com brilho e camiseta oversized: um contraste entre noite e dia.",
      items: ["saia-midi-brilho", "camiseta-oversized"],
      image: { file: "look-saia-paete", alt: "Look com saia midi preta com brilho e camiseta branca oversized", position: "50% 40%", illustrative: true }
    },
    {
      id: "look-preto-total",
      ref: "LOOK-02",
      name: "Preto total",
      description: "Top corset com calça cargo de pernas amplas.",
      items: ["top-corset", "calca-cargo"],
      image: { file: "look-corset-cargo", alt: "Look preto com top corset sem alças e calça cargo ampla", position: "50% 45%", illustrative: true }
    }
  ],

  about: {
    /* Parágrafos aprovados pela boutique. Enquanto `null`, o site mostra o espaço reservado. */
    paragraphs: null,
    image: { file: "vestido-midi-animal-print", alt: "Interior da boutique com parede de tijolos brancos, poltrona e araras", position: "50% 30%", illustrative: true }
  },

  /* Fotos para "Acompanhe a boutique". Usar somente imagens autorizadas. */
  instagramImages: [
    { file: "look-vestido-estampado", alt: "Vestido longo estampado no provador", position: "50% 30%", illustrative: true },
    { file: "vestido-longo-off-white", alt: "Vestido longo claro de alças", position: "50% 30%", illustrative: true },
    { file: "look-corset-cargo", alt: "Look preto com corset e calça cargo", position: "50% 40%", illustrative: true },
    { file: "look-saia-paete", alt: "Saia com brilho e camiseta branca", position: "50% 45%", illustrative: true }
  ],

  /* Perguntas frequentes. `answer: null` exibe "Resposta pendente de confirmação". */
  faq: [
    { question: "Como consultar tamanhos e disponibilidade?", answer: null },
    { question: "Posso experimentar na loja?", answer: null },
    { question: "Há entrega ou retirada?", answer: null },
    { question: "Quais formas de pagamento são aceitas?", answer: null },
    { question: "Como funcionam trocas?", answer: null },
    { question: "Como falar com a equipe?", answer: null }
  ],

  /* Exibe filtros de categoria só quando houver dados suficientes. */
  filters: { minProducts: 6, minCategories: 2 }
};
