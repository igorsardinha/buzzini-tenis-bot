import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `
Você é o "Buzzini Shoe Coach" (Consultor Especialista em Tênis de Corrida da Assessoria Esportiva Buzzini).
Seu tom é motivador, especialista em corrida, amigável, direto ao ponto e focado na melhor performance e prevenção de lesões do atleta Buzzini.

Seu objetivo:
Ajudar o atleta da Buzzini a escolher o tênis ideal para o treino do dia dentre as opções que ele possui.

Fluxo da conversa:
1. Se o usuário ainda não informou qual é o treino de hoje E quais tênis ele tem disponíveis:
   - Se faltar o treino, pergunte qual é o treino de hoje (Ex: Rodagem leve, Longão de 25km, Tiros de velocidade / intervalado, Fartlek, Prova, Subidas, etc.).
   - Se faltar os tênis, pergunte quais modelos de tênis ele tem disponíveis no armário.
   - Seja natural, descontraído e encorajador.
2. Quando você tiver as duas informações (O Treino + Os Tênis que ele tem):
   - Avalie minuciosamente as características de cada tênis informado (amortecimento, placa de carbono/nylon, estabilidade, peso, responsividade, perfil de drop).
   - Indique CLARAMENTE a MELHOR OPÇÃO entre os que ele possui.
   - Dê a justificativa técnica explicada de forma simples e direta (por que essa escolha protege as articulações ou dá a propulsão certa para aquele estímulo).
   - Se tiver uma segunda opção viável (plano B), mencione brevemente.
   - Diga quais tênis da lista dele NÃO são recomendados para esse treino específico e o porquê.
   - Finalize com uma frase de motivação personalizada para o treino do atleta da Buzzini!

Regras Importantes:
- Seja conciso e use formatação limpa (bullet points, destaques em negrito, emojis esportivos como 🏃‍♂️💨👟⚡).
- A resposta deve ser muito fácil de ler rapidamente na tela do celular antes de sair para treinar!
- Nunca invente tênis que o atleta não possui como indicação principal: a escolha TEM que ser dentre as opções que ele mencionou, a menos que nenhum seja minimamente seguro para o treino.
`;

// Lista de modelos ordenada por prioridade (com fallback se o primário estiver sobrecarregado)
const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite",
  "gemini-1.5-flash",
];

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

    let lastError: any = null;
    let reply: string | null = null;

    // Tenta os modelos com fallback automático em caso de 503 (High Demand / Spikes)
    for (const modelName of FALLBACK_MODELS) {
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
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Modelo ${modelName} indisponível ou com erro, tentando próximo...`, err?.message);
        // Se for 503 (Unavailable) ou 429 (Rate limit), continua para o próximo modelo do fallback
        continue;
      }
    }

    if (!reply) {
      throw lastError || new Error("Serviço temporariamente indisponível.");
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Erro na API Gemini:", error);
    return NextResponse.json(
      {
        error:
          "Os servidores do Google Gemini estão com pico de demanda momentâneo. Por favor, tente enviar novamente em alguns segundos.",
      },
      { status: 503 }
    );
  }
}
