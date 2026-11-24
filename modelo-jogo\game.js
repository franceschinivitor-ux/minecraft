// ==========================================
// MINEBLOCKS - LÓGICA DO JOGO (AREA E PERIMETRO)
// ==========================================

// Configurações principais do jogo
const TAMANHO_GRADE = 8; // Grade 8x8 (64 blocos no total)
const PONTOS_POR_ACERTO = 10;
const VIDAS_INICIAIS = 3;

// Lista das 10 rodadas com dificuldade aumentando aos poucos
const RODADAS = [
  {
    tipo: "Área",
    titulo: "1. Piso da Cabana",
    descricao: "Construa um piso unido (todos os blocos encostados) com exatamente 6 m² de área.",
    verificar: (info) => {
      if (info.totalBlocos === 0) return { ok: false, motivo: "Você ainda não colocou nenhum bloco na grade." };
      if (!info.conectado) return { ok: false, motivo: "Os blocos precisam ficar todos juntos, encostando pelos lados." };
      if (info.totalBlocos !== 6) {
        return { ok: false, motivo: `Sua obra tem ${info.totalBlocos} m² de área, mas o pedido é de 6 m².` };
      }
      return { ok: true, motivo: "Mandou bem! 6 blocos unidos formam exatamente 6 m² de área." };
    }
  },
  {
    tipo: "Área",
    titulo: "2. Base Quadrada",
    descricao: "Monte uma base em formato de quadrado com 9 m² de área.",
    verificar: (info) => {
      if (!info.conectado || info.totalBlocos === 0) {
        return { ok: false, motivo: "Coloque os blocos juntos formando uma única peça." };
      }
      if (info.totalBlocos !== 9 || !info.ehQuadrado) {
        return {
          ok: false,
          motivo: `Você montou ${info.totalBlocos} m². Um quadrado de 9 m² precisa ter 3 m de lado (3 × 3 = 9).`
        };
      }
      return { ok: true, motivo: "Perfeito! Um quadrado de 3 m × 3 m tem área igual a 9 m²." };
    }
  },
  {
    tipo: "Perímetro",
    titulo: "3. Cercado Quadrado",
    descricao: "Construa um terreno quadrado preenchido que tenha 12 m de perímetro (contorno).",
    verificar: (info) => {
      if (!info.conectado || info.totalBlocos === 0) {
        return { ok: false, motivo: "Junte os blocos para formar um terreno fechado." };
      }
      if (!info.ehQuadrado || info.perimetro !== 12) {
        return {
          ok: false,
          motivo: `Sua figura tem ${info.perimetro} m de perímetro. Para dar 12 m em um quadrado, cada lado deve medir 3 m (3 + 3 + 3 + 3 = 12).`
        };
      }
      return { ok: true, motivo: "Isso aí! 4 lados de 3 m somam 12 m de perímetro." };
    }
  },
  {
    tipo: "Área",
    titulo: "4. Horta Retangular",
    descricao: "Crie uma horta em formato de retângulo preenchido com 12 m² de área.",
    verificar: (info) => {
      if (!info.conectado || !info.ehRetangulo) {
        return { ok: false, motivo: "A horta precisa ser um retângulo certinho, sem falhas ou pontas sobrando." };
      }
      if (info.totalBlocos !== 12) {
        return {
          ok: false,
          motivo: `Seu retângulo tem ${info.totalBlocos} m². Tente fazer 3 m × 4 m ou 2 m × 6 m para dar 12 m².`
        };
      }
      return { ok: true, motivo: `Boa! Um retângulo ${info.largura} m × ${info.altura} m tem ${info.totalBlocos} m² de área.` };
    }
  },
  {
    tipo: "Perímetro",
    titulo: "5. Muralha Retangular",
    descricao: "Monte um terreno retangular preenchido com exatamente 14 m de perímetro.",
    verificar: (info) => {
      if (!info.conectado || !info.ehRetangulo) {
        return { ok: false, motivo: "O terreno precisa formar um retângulo completo." };
      }
      if (info.perimetro !== 14) {
        return {
          ok: false,
          motivo: `O contorno da sua obra deu ${info.perimetro} m. Dica: um retângulo de 3 m × 4 m tem perímetro 3 + 4 + 3 + 4 = 14 m.`
        };
      }
      return { ok: true, motivo: `Acertou! Lados de ${info.largura} m e ${info.altura} m somam 14 m de contorno.` };
    }
  },
  {
    tipo: "Área",
    titulo: "6. Salão Principal",
    descricao: "Construa um salão quadrado preenchido com 16 m² de área.",
    verificar: (info) => {
      if (!info.conectado || !info.ehQuadrado || info.totalBlocos !== 16) {
        return {
          ok: false,
          motivo: `Você usou ${info.totalBlocos} m². Como 4 × 4 = 16, o salão precisa ser um quadrado de 4 m de lado.`
        };
      }
      return { ok: true, motivo: "Excelente! 4 m × 4 m = 16 m² de área." };
    }
  },
  {
    tipo: "Área + Perímetro",
    titulo: "7. Ponte de Pedra",
    descricao: "Construa um retângulo com 8 m² de área e 12 m de perímetro.",
    verificar: (info) => {
      if (!info.conectado || !info.ehRetangulo) {
        return { ok: false, motivo: "A ponte precisa ter o formato de um retângulo preenchido." };
      }
      if (info.totalBlocos !== 8 || info.perimetro !== 12) {
        return {
          ok: false,
          motivo: `Sua obra ficou com ${info.totalBlocos} m² de área e ${info.perimetro} m de perímetro. Um retângulo 2 m × 4 m resolve os dois!`
        };
      }
      return { ok: true, motivo: "Na mosca! 2 × 4 = 8 m² de área e 2 + 4 + 2 + 4 = 12 m de perímetro." };
    }
  },
  {
    tipo: "Área Composta",
    titulo: "8. Plataforma em L",
    descricao: "Construa uma plataforma unida em formato de L (não pode ser retângulo) com 10 m² de área.",
    verificar: (info) => {
      if (!info.conectado || info.totalBlocos === 0) {
        return { ok: false, motivo: "Todos os blocos da plataforma precisam estar conectados." };
      }
      if (info.ehRetangulo) {
        return { ok: false, motivo: "Você fez um retângulo! Faça uma dobra para formar um L com 10 blocos." };
      }
      if (info.totalBlocos !== 10) {
        return {
          ok: false,
          motivo: `Sua plataforma tem ${info.totalBlocos} m², mas precisa ter exatamente 10 blocos (10 m²).`
        };
      }
      return { ok: true, motivo: "Muito bom! Mesmo em formato de L, a área é a soma dos 10 quadrados: 10 m²." };
    }
  },
  {
    tipo: "Área + Perímetro",
    titulo: "9. Pátio da Escola",
    descricao: "Monte um terreno retangular com 15 m² de área e 16 m de perímetro.",
    verificar: (info) => {
      if (!info.conectado || !info.ehRetangulo) {
        return { ok: false, motivo: "O pátio deve ser um retângulo completo." };
      }
      if (info.totalBlocos !== 15 || info.perimetro !== 16) {
        return {
          ok: false,
          motivo: `Você fez ${info.totalBlocos} m² e ${info.perimetro} m de perímetro. Pense em dois números que multiplicados dão 15 (3 × 5).`
        };
      }
      return { ok: true, motivo: "Show! 3 m × 5 m = 15 m² de área e 3 + 5 + 3 + 5 = 16 m de perímetro." };
    }
  },
  {
    tipo: "Desafio Final",
    titulo: "10. Fortaleza Mestre",
    descricao: "Construa uma fortaleza unida (qualquer formato) com 12 m² de área e 16 m de perímetro.",
    verificar: (info) => {
      if (!info.conectado || info.totalBlocos === 0) {
        return { ok: false, motivo: "Todos os blocos da fortaleza precisam estar ligados entre si." };
      }
      if (info.totalBlocos !== 12 || info.perimetro !== 16) {
        return {
          ok: false,
          motivo: `Sua fortaleza tem ${info.totalBlocos} m² de área e ${info.perimetro} m de perímetro. O alvo é 12 m² e 16 m!`
        };
      }
      return { ok: true, motivo: "Incrível! Você dominou área e perímetro como um verdadeiro Mestre dos Blocos!" };
    }
  }
];

// Variáveis de estado do jogo
let indiceRodada = 0;
let pontos = 0;
let vidas = VIDAS_INICIAIS;
let materialSelecionado = "grama";
let grade = []; // Matriz 8x8 guardando null ou o nome do material
let rodadaRespondida = false;
let tempoInicio = 0;

// Elementos da tela
const telaInicio = document.getElementById("tela-inicio");
const telaJogo = document.getElementById("tela-jogo");
const telaFim = document.getElementById("tela-fim");

const gradeTerreno = document.getElementById("grade-terreno");
const rodadaAtualEl = document.getElementById("rodada-atual");
const pontosAtuaisEl = document.getElementById("pontos-atuais");
const vidasContainerEl = document.getElementById("vidas-container");

const etiquetaTipoEl = document.getElementById("etiqueta-tipo");
const tituloDesafioEl = document.getElementById("titulo-desafio");
const descricaoDesafioEl = document.getElementById("descricao-desafio");

const caixaFeedback = document.getElementById("caixa-feedback");
const textoFeedback = document.getElementById("texto-feedback");
const acoesRodada = document.querySelector(".acoes-rodada");

const btnIniciar = document.getElementById("btn-iniciar");
const btnLimpar = document.getElementById("btn-limpar");
const btnConferir = document.getElementById("btn-conferir");
const btnProximo = document.getElementById("btn-proximo");
const btnReiniciar = document.getElementById("btn-reiniciar");
const btnTema = document.getElementById("btn-tema");
const botoesMaterial = document.querySelectorAll(".btn-material");

// ==========================================
// COMUNICAÇÃO COM O PORTAL DA ESCOLA
// ==========================================

function avisarAlturaPortal() {
  const altura = document.documentElement.scrollHeight;
  window.parent.postMessage({ type: "vrgame:resize", height: altura }, "*");
}

function aplicarTema(tema) {
  if (tema === "dark" || tema === "escuro") {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
  avisarAlturaPortal();
}

window.addEventListener("message", (evento) => {
  const dados = evento.data;
  if (!dados || typeof dados !== "object") return;

  if (dados.type === "vrgame:theme") {
    const temaRecebido = dados.theme || dados.value || "light";
    aplicarTema(temaRecebido);
  }

  if (dados.type === "vrgame:fullscreen") {
    const container = document.getElementById("app");
    if (dados.fullscreen) {
      container.style.maxWidth = "900px";
    } else {
      container.style.maxWidth = "640px";
    }
    avisarAlturaPortal();
  }
});

window.addEventListener("resize", avisarAlturaPortal);

// ==========================================
// CONSTRUÇÃO E INTERAÇÃO COM A GRADE
// ==========================================

function criarMatrizVazia() {
  const novaGrade = [];
  for (let linha = 0; linha < TAMANHO_GRADE; linha++) {
    const fila = [];
    for (let coluna = 0; coluna < TAMANHO_GRADE; coluna++) {
      fila.push(null);
    }
    novaGrade.push(fila);
  }
  return novaGrade;
}

function desenharGrade() {
  gradeTerreno.innerHTML = "";

  for (let linha = 0; linha < TAMANHO_GRADE; linha++) {
    for (let coluna = 0; coluna < TAMANHO_GRADE; coluna++) {
      const botaoCelula = document.createElement("button");
      botaoCelula.type = "button";
      botaoCelula.className = "celula-bloco";
      botaoCelula.setAttribute("role", "gridcell");
      botaoCelula.setAttribute("aria-label", `Linha ${linha + 1}, Coluna ${coluna + 1}`);

      const material = grade[linha][coluna];
      if (material) {
        botaoCelula.classList.add("preenchida", material);
        botaoCelula.setAttribute("aria-pressed", "true");
      } else {
        botaoCelula.setAttribute("aria-pressed", "false");
      }

      botaoCelula.addEventListener("click", () => alternarBloco(linha, coluna));
      gradeTerreno.appendChild(botaoCelula);
    }
  }
}

function alternarBloco(linha, coluna) {
  // Não permite mexer nos blocos depois que o jogador já conferiu a rodada
  if (rodadaRespondida) return;

  if (grade[linha][coluna] === null) {
    grade[linha][coluna] = materialSelecionado;
  } else {
    grade[linha][coluna] = null;
  }
  desenharGrade();
}

// ==========================================
// CÁLCULO DE ÁREA, PERÍMETRO E FORMATO
// ==========================================

function analisarConstrucao() {
  let totalBlocos = 0;
  let perimetro = 0;
  let primeiroBloco = null;

  let minLinha = TAMANHO_GRADE;
  let maxLinha = -1;
  let minColuna = TAMANHO_GRADE;
  let maxColuna = -1;

  for (let l = 0; l < TAMANHO_GRADE; l++) {
    for (let c = 0; c < TAMANHO_GRADE; c++) {
      if (grade[l][c] !== null) {
        totalBlocos++;
        if (!primeiroBloco) primeiroBloco = [l, c];

        if (l < minLinha) minLinha = l;
        if (l > maxLinha) maxLinha = l;
        if (c < minColuna) minColuna = c;
        if (c > maxColuna) maxColuna = c;

        // Cada bloco começa com 4 lados; descontamos os lados encostados em vizinhos
        let ladosLivres = 4;
        if (l > 0 && grade[l - 1][c] !== null) ladosLivres--;
        if (l < TAMANHO_GRADE - 1 && grade[l + 1][c] !== null) ladosLivres--;
        if (c > 0 && grade[l][c - 1] !== null) ladosLivres--;
        if (c < TAMANHO_GRADE - 1 && grade[l][c + 1] !== null) ladosLivres--;

        perimetro += ladosLivres;
      }
    }
  }

  // Verifica se todos os blocos estão conectados em uma única peça
  let conectado = false;
  if (primeiroBloco) {
    const visitados = new Set();
    const fila = [primeiroBloco];
    visitados.add(`${primeiroBloco[0]},${primeiroBloco[1]}`);

    while (fila.length > 0) {
      const [l, c] = fila.shift();
      const vizinhos = [
        [l - 1, c],
        [l + 1, c],
        [l, c - 1],
        [l, c + 1]
      ];

      for (const [vl, vc] of vizinhos) {
        const fora = vl < 0 || vl >= TAMANHO_GRADE || vc < 0 || vc >= TAMANHO_GRADE;
        const chave = `${vl},${vc}`;
        if (!fora && grade[vl][vc] !== null && !visitados.has(chave)) {
          visitados.add(chave);
          fila.push([vl, vc]);
        }
      }
    }
    conectado = visitados.size === totalBlocos;
  }

  const largura = totalBlocos > 0 ? maxColuna - minColuna + 1 : 0;
  const altura = totalBlocos > 0 ? maxLinha - minLinha + 1 : 0;
  const ehRetangulo = conectado && totalBlocos > 0 && largura * altura === totalBlocos;
  const ehQuadrado = ehRetangulo && largura === altura;

  return {
    totalBlocos,
    perimetro,
    conectado,
    largura,
    altura,
    ehRetangulo,
    ehQuadrado
  };
}

// ==========================================
// FLUXO DAS RODADAS
// ==========================================

function atualizarBarraStatus() {
  rodadaAtualEl.textContent = `${indiceRodada + 1} / ${RODADAS.length}`;
  pontosAtuaisEl.textContent = pontos;

  const coracoesCheios = "❤️".repeat(vidas);
  const coracoesVazios = "🖤".repeat(VIDAS_INICIAIS - vidas);
  vidasContainerEl.textContent = coracoesCheios + coracoesVazios;
  vidasContainerEl.setAttribute("aria-label", `${vidas} vidas restantes`);
}

function carregarRodada() {
  const desafio = RODADAS[indiceRodada];
  rodadaRespondida = false;
  grade = criarMatrizVazia();

  etiquetaTipoEl.textContent = desafio.tipo;
  tituloDesafioEl.textContent = desafio.titulo;
  descricaoDesafioEl.textContent = desafio.descricao;

  caixaFeedback.className = "caixa-feedback oculto";
  textoFeedback.textContent = "";

  btnLimpar.classList.remove("oculto");
  btnConferir.classList.remove("oculto");
  btnProximo.classList.add("oculto");
  acoesRodada.classList.remove("modo-proximo");

  atualizarBarraStatus();
  desenharGrade();
  avisarAlturaPortal();
}

function conferirObra() {
  if (rodadaRespondida) return;

  const desafio = RODADAS[indiceRodada];
  const info = analisarConstrucao();
  const resultado = desafio.verificar(info);

  rodadaRespondida = true;
  caixaFeedback.classList.remove("oculto", "acerto", "erro");

  if (resultado.ok) {
    pontos += PONTOS_POR_ACERTO;
    caixaFeedback.classList.add("acerto");
    textoFeedback.textContent = `✅ Muito bem! ${resultado.motivo}`;
  } else {
    vidas = Math.max(0, vidas - 1);
    caixaFeedback.classList.add("erro");
    textoFeedback.textContent = `❌ Quase lá! ${resultado.motivo}`;
  }

  atualizarBarraStatus();

  btnLimpar.classList.add("oculto");
  btnConferir.classList.add("oculto");
  btnProximo.classList.remove("oculto");
  acoesRodada.classList.add("modo-proximo");

  if (vidas === 0 || indiceRodada === RODADAS.length - 1) {
    btnProximo.textContent = "Ver Resultado Final";
  } else {
    btnProximo.textContent = "Próxima Rodada";
  }

  avisarAlturaPortal();
}

function avancarRodada() {
  if (vidas === 0 || indiceRodada >= RODADAS.length - 1) {
    finalizarJogo();
  } else {
    indiceRodada++;
    carregarRodada();
  }
}

function iniciarJogo() {
  indiceRodada = 0;
  pontos = 0;
  vidas = VIDAS_INICIAIS;
  tempoInicio = Date.now();

  telaInicio.classList.add("oculto");
  telaFim.classList.add("oculto");
  telaJogo.classList.remove("oculto");

  carregarRodada();
}

function finalizarJogo() {
  const maximo = RODADAS.length * PONTOS_POR_ACERTO;
  const tempoEmMs = Date.now() - tempoInicio;

  telaJogo.classList.add("oculto");
  telaFim.classList.remove("oculto");

  const tituloFinal = document.getElementById("titulo-final");
  const resumoFinal = document.getElementById("resumo-final");
  const pontuacaoFinal = document.getElementById("pontuacao-final");

  if (vidas === 0) {
    tituloFinal.textContent = "Fim de Jogo — Acabaram os Corações!";
    resumoFinal.textContent = "Não desanime! Revise as dicas de área e perímetro e tente construir de novo.";
  } else {
    tituloFinal.textContent = "Construção Concluída!";
    resumoFinal.textContent = "Você completou todas as 10 rodadas da bancada do MineBlocks!";
  }

  pontuacaoFinal.textContent = `${pontos} / ${maximo}`;
  avisarAlturaPortal();

  // Envia o resultado final para o portal da escola
  window.parent.postMessage(
    {
      type: "vrgame:finish",
      score: pontos,
      maxScore: maximo,
      timeMs: tempoEmMs,
      detail: { jogo: "mineblocks" }
    },
    "*"
  );
}

// ==========================================
// EVENTOS DOS BOTÕES
// ==========================================

btnIniciar.addEventListener("click", iniciarJogo);
btnReiniciar.addEventListener("click", iniciarJogo);

btnLimpar.addEventListener("click", () => {
  if (rodadaRespondida) return;
  grade = criarMatrizVazia();
  desenharGrade();
});

btnConferir.addEventListener("click", conferirObra);
btnProximo.addEventListener("click", avancarRodada);

btnTema.addEventListener("click", () => {
  const estaEscuro = document.documentElement.getAttribute("data-theme") === "dark";
  aplicarTema(estaEscuro ? "light" : "dark");
});

botoesMaterial.forEach((botao) => {
  botao.addEventListener("click", () => {
    botoesMaterial.forEach((b) => b.classList.remove("ativo"));
    botao.classList.add("ativo");
    materialSelecionado = botao.dataset.material;
  });
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================

window.addEventListener("DOMContentLoaded", () => {
  window.parent.postMessage({ type: "vrgame:ready" }, "*");
  avisarAlturaPortal();
});