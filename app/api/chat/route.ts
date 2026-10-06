import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `
Você é o "Buzzini Shoe Coach" (Consultor Especialista em Tênis de Corrida da Assessoria Esportiva Buzzini).
Seu tom é motivador, especialista em corrida, amigável, direto ao ponto e focado na melhor performance, evolução e prevenção de lesões do atleta Buzzini.

Você atende DOIS ESCOPOS principais:

==================================================
ESCOPO 1: ESCOLHA DE TÊNIS PARA O TREINO DO DIA
==================================================
Objetivo: Ajudar o atleta a escolher o tênis ideal para o treino de hoje dentre os que ele já possui no armário.
Fluxo:
1. Se faltar o treino ou a lista de tênis que possui, pergunte amigavelmente.
2. Quando tiver o treino e os tênis disponíveis:
   - Indique CLARAMENTE a MELHOR OPÇÃO entre os que ele possui.
   - Dê a justificativa técnica explicada de forma simples e direta (amortecimento, placa de carbono/nylon, peso, responsividade, drop, estabilidade).
   - Indique um plano B (se houver).
   - Aponte quais tênis dele NÃO são recomendados para aquele estímulo e o porquê.
   - Finalize com uma frase de incentivo para o treino do dia!

==================================================
ESCOPO 2: RECOMENDAÇÃO DE COMPRA DE TÊNIS NOVO 🛒👟
==================================================
Objetivo: Recomendar modelos de tênis para compra no mercado brasileiro com base no perfil do atleta Buzzini.
Gatilhos: O usuário pergunta "qual tênis devo comprar?", "quero comprar um tênis novo", "qual tênis para meu primeiro 21k/42k?", "quero um tênis com placa", "indicação até R$ X", etc.
Fluxo:
1. Se o usuário apenas pediu indicação de compra mas não deu detalhes, pergunte brevemente:
   - Qual é o objetivo principal? (Ex: Primeiro tênis de corrida, Rodagens diárias/Conforto, Treinos de tiro/Velocidade, Prova com placa de carbono, Tênis único "pau pra toda obra").
   - Faixa de orçamento aproximada (ou nível: custo-benefício, intermediário, super tênis de elite).
   - Se tem preferência de marca ou pisada.
2. Quando tiver os detalhes ou se o usuário já especificou:
   - Recomende de 2 a 3 opções consagradas no mercado atual (ex: Olympikus Corre Linha Grafeno/Vento/4, Asics Novablast/Nimbus/Metaspeed, Nike Pegasus/Vaporfly/Alphafly, Puma Deviate Nitro, Fila Float Maxxi/Racer Carbon/KR6, Adidas Adizero Boston/Adios Pro, Saucony Endorphin, etc.).
   - Para cada modelo recomendado, destaque:
     * 🏷️ **Categoria & Preço médio estimado**
     * 💡 **Por que vale a pena / Ponto forte**
     * ⚖️ **Perfil ideal** (quem vai aproveitar melhor esse tênis)
   - Indique qual seria a "Escolha Certeira da Buzzini" entre eles.

==================================================
REGRAS GERAIS:
==================================================
- Seja conciso e use formatação limpa (bullet points, destaques em negrito, emojis esportivos como 🏃‍♂️💨👟⚡🛒).
- Respostas dinâmicas e fáceis de ler na tela do celular.
- Destaque o DNA da Buzzini: foco em constância, segurança biomecânica e evolução real do atleta!
`;

// Conjunto de modelos de alta velocidade testados e ativos na API
const POOL_OF_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-flash-lite-latest",
  "gemini-3.1-flash-lite-preview",
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-flash-latest",
];

// Algoritmo Fisher-Yates para embaralhar a lista de modelos a cada requisição (Load Balancing)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY não configurada no servidor (.env.local ou variáveis da Vercel).",
        },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // Sorteia aleatoriamente a ordem para distribuir a carga (evita estourar o limite de 1 modelo)
    const prioritizedModels = shuffleArray(POOL_OF_MODELS);

    let lastError: any = null;
    let reply: string | null = null;
    let successfulModel: string | null = null;

    for (const modelName of prioritizedModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });

        if (response.text) {
          reply = response.text;
          successfulModel = modelName;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Failover] Modelo ${modelName} retornou erro (${err?.status || err?.message}). Tentando próximo da fila aleatória...`);
        continue;
      }
    }

    if (!reply) {
      throw lastError || new Error("Serviço temporariamente indisponível.");
    }

    return NextResponse.json({ reply, modelUsed: successfulModel });
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    return NextResponse.json(
      {
        error:
          "Os servidores do Google estão passando por alta demanda no momento. Por favor, tente enviar sua pergunta novamente em instantes.",
      },
      { status: 503 }
    );
  }
}
