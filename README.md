# Buzzini Shoe Coach 👟🏃‍♂️

Agente conversacional especializado em corrida da **Buzzini Assessoria Esportiva**, desenvolvido com **Next.js (App Router)**, **Tailwind CSS**, **Google Gemini API (@google/genai)** e interface 100% otimizada para mobile.

---

## 🚀 Como rodar localmente

1. Entre no diretório do projeto:
   ```bash
   cd buzzini-tenis-bot
   ```

2. Crie o arquivo `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
   Abra `.env.local` e insira sua chave da API do Google Gemini:
   ```env
   GEMINI_API_KEY=sua_chave_aqui
   ```
   *(Obtenha gratuitamente no [Google AI Studio](https://aistudio.google.com/app/apikey))*

3. Inicie o servidor local:
   ```bash
   npm run dev
   ```
   Acesse `http://localhost:3000` pelo navegador (ou use a visualização de dispositivos móveis no DevTools com `F12` > `Ctrl+Shift+M`).

---

## 🌐 Como fazer o deploy na Vercel

1. Suba este repositório para o seu GitHub (ou use a CLI `vercel`):
   ```bash
   git add .
   git commit -m "feat: buzzini shoe coach bot"
   # vincule ao seu repo no github
   ```
2. Na [Vercel](https://vercel.com):
   - Importe o repositório **buzzini-tenis-bot**.
   - Em **Environment Variables**, adicione:
     - `GEMINI_API_KEY`: sua chave de API do Gemini.
3. Clique em **Deploy**! A Vercel cuidará do build automaticamente.
