"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Sparkles, RotateCcw, Flame, ShieldAlert } from "lucide-react";
import confetti from "canvas-confetti";
import { sendGTMEvent } from "@/lib/gtm";

interface Message {
	id: string;
	role: "assistant" | "user";
	content: string;
	timestamp: string;
}

const QUICK_PROMPTS = [
	{ label: "🏃‍♂️ Treino de Hoje", text: "Treino de hoje: " },
	{ label: "🛒 Quero Comprar um Tênis", text: "Estou querendo comprar um tênis novo. Meu objetivo é: " },
	{ label: "⚡ Tiros / Intervalado", text: "Treino de tiros/intervalado. Tenho os tênis: " },
	{ label: "🏔️ Longão de Fim de Semana", text: "Longão de fim de semana. Meus tênis são: " },
	{ label: "🚀 Tênis com Placa de Carbono", text: "Qual tênis com placa de carbono você recomenda comprar?" },
	{ label: "💰 Melhor Custo-Benefício", text: "Qual o melhor tênis de corrida custo-benefício para comprar atualmente?" },
];

const INITIAL_GREETING =
	"Fala atleta Buzzini! 🏃‍♂️💨\n\nEu sou o seu **Shoe Coach da Buzzini**. Estou aqui para:\n1. 👟 **Escolher o melhor tênis para o seu treino de hoje** (entre os que você já tem no armário);\n2. 🛒 **Indicar o tênis ideal para você comprar** (com base no seu objetivo, orçamento e perfil).\n\nComo posso te ajudar hoje?";

export default function Home() {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "init",
			role: "assistant",
			content: INITIAL_GREETING,
			timestamp: "Agora",
		},
	]);
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [errorBanner, setErrorBanner] = useState<string | null>(null);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, isLoading]);

	const handleSend = async (textToSend?: string) => {
		const text = (textToSend || input).trim();
		if (!text || isLoading) return;

		setErrorBanner(null);

		const userMsg: Message = {
			id: Date.now().toString(),
			role: "user",
			content: text,
			timestamp: new Date().toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
			}),
		};

		const newMessages = [...messages, userMsg];
		setMessages(newMessages);
		setInput("");

		sendGTMEvent({
			event: "athlete_message_sent",
			message_length: text.length,
			is_quick_suggestion: QUICK_PROMPTS.some((w) => text.includes(w.label)),
		});

		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messages: newMessages.map((m) => ({
						role: m.role,
						content: m.content,
					})),
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Falha na comunicação com o assistente.");
			}

			// Solta confete se tiver recomendação definida
			if (
				data.reply.toLowerCase().includes("melhor opção") ||
				data.reply.toLowerCase().includes("recomendo") ||
				data.reply.toLowerCase().includes("escolha ideal")
			) {
				sendGTMEvent({
					event: "shoe_recommendation_received",
				});

				try {
					confetti({
						particleCount: 40,
						spread: 60,
						origin: { y: 0.8 },
						colors: ["#ea580c", "#f97316", "#fbbf24", "#3b82f6"],
					});
				} catch {
					// ignore confetti error
				}
			}

			const botMsg: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: data.reply,
				timestamp: new Date().toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit",
				}),
			};

			setMessages((prev) => [...prev, botMsg]);
		} catch (err: any) {
			setErrorBanner(err.message || "Erro inesperado ao consultar o Gemini.");
		} finally {
			setIsLoading(false);
		}
	};

	const handleReset = () => {
		sendGTMEvent({ event: "chat_reset" });
		setMessages([
			{
				id: Date.now().toString(),
				role: "assistant",
				content: INITIAL_GREETING,
				timestamp: "Agora",
			},
		]);
		setInput("");
		setErrorBanner(null);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="flex justify-center min-h-[100dvh] bg-neutral-950 text-neutral-100 font-sans">
			{/* Mobile container - Max-w-md cria a moldura de app mobile elegante */}
			<div className="w-full max-w-md flex flex-col h-[100dvh] bg-neutral-900 border-x border-neutral-800 shadow-2xl relative">
				{/* Header com Logo Buzzini */}
				<header className="px-4 py-3 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 flex items-center justify-between sticky top-0 z-20">
					<div className="flex items-center gap-3">
						<div className="relative w-9 h-9 flex items-center justify-center p-1 rounded-xl bg-neutral-900 border border-neutral-800 shadow-inner">
							<Image
								src="/logo_buzzini.svg"
								alt="Buzzini Assessoria Esportiva"
								width={30}
								height={30}
								className="object-contain"
								priority
							/>
						</div>
						<div>
							<div className="flex items-center gap-2">
								<span className="font-extrabold text-sm tracking-wider uppercase text-white font-sans">
									BUZZINI BOT
								</span>
							</div>
							<p className="text-[11px] text-neutral-400 flex items-center gap-1 font-sans">
								<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
								Coach de Tênis • Assessoria Esportiva
							</p>
						</div>
					</div>

					<button
						onClick={handleReset}
						title="Reiniciar conversa"
						className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 active:scale-95 transition-all cursor-pointer">
						<RotateCcw className="w-4 h-4" />
					</button>
				</header>

				{/* Error Banner se faltar chave ou houver falha de rede */}
				{errorBanner && (
					<div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2.5 text-xs text-red-300 flex items-start gap-2">
						<ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
						<div className="flex-1">
							<p className="font-semibold">Aviso:</p>
							<p className="text-red-300/90">{errorBanner}</p>
						</div>
					</div>
				)}

				{/* Messages Stream */}
				<main className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scroll-smooth">
					{messages.map((m) => {
						const isUser = m.role === "user";
						return (
							<div
								key={m.id}
								className={`flex flex-col ${
									isUser ? "items-end" : "items-start"
								}`}>
								<div
									className={`max-w-[90%] rounded-2xl p-3.5 leading-relaxed shadow-sm break-words ${
										isUser
											? "bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-tr-xs"
											: "bg-neutral-800/90 text-neutral-200 border border-neutral-700/60 rounded-tl-xs"
									}`}>
									{/* Message role indicator */}
									{!isUser && (
										<div className="flex items-center gap-1.5 text-[11px] font-semibold text-orange-400 mb-2 border-b border-neutral-700/40 pb-1">
											<Sparkles className="w-3.5 h-3.5" /> Buzzini Shoe Coach
										</div>
									)}

									{/* Renderização de Markdown rica e sem poluição de tags */}
									{isUser ? (
										<div className="text-[13.5px] whitespace-pre-wrap">
											{m.content}
										</div>
									) : (
										<div className="text-[13.5px] space-y-2">
											<ReactMarkdown
												remarkPlugins={[remarkGfm]}
												components={{
													h1: ({ children }) => (
														<h1 className="text-base font-bold text-white mt-2 mb-1">
															{children}
														</h1>
													),
													h2: ({ children }) => (
														<h2 className="text-sm font-bold text-orange-400 mt-2 mb-1 border-b border-neutral-700/50 pb-0.5">
															{children}
														</h2>
													),
													h3: ({ children }) => (
														<h3 className="text-[13.5px] font-semibold text-amber-300 mt-1.5 mb-1">
															{children}
														</h3>
													),
													p: ({ children }) => (
														<p className="leading-relaxed mb-1.5 last:mb-0">
															{children}
														</p>
													),
													ul: ({ children }) => (
														<ul className="list-disc pl-4 space-y-1 my-1.5 text-neutral-200">
															{children}
														</ul>
													),
													ol: ({ children }) => (
														<ol className="list-decimal pl-4 space-y-1 my-1.5 text-neutral-200">
															{children}
														</ol>
													),
													li: ({ children }) => (
														<li className="leading-snug">{children}</li>
													),
													strong: ({ children }) => (
														<strong className="font-semibold text-white">
															{children}
														</strong>
													),
													em: ({ children }) => (
														<em className="text-neutral-300 italic">
															{children}
														</em>
													),
												}}>
												{m.content}
											</ReactMarkdown>
										</div>
									)}
								</div>
								<span className="text-[10px] text-neutral-500 px-1 mt-1 font-sans">
									{m.timestamp}
								</span>
							</div>
						);
					})}

					{isLoading && (
						<div className="flex flex-col items-start">
							<div className="bg-neutral-800/90 border border-neutral-700/60 rounded-2xl rounded-tl-xs p-3.5 flex items-center gap-2">
								<div className="flex space-x-1">
									<div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.3s]"></div>
									<div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce [animation-delay:-0.15s]"></div>
									<div className="w-2 h-2 rounded-full bg-orange-500 animate-bounce"></div>
								</div>
								<span className="text-xs text-neutral-400 pl-1 font-sans">
									Analisando seus tênis e o treino...
								</span>
							</div>
						</div>
					)}

					<div ref={messagesEndRef} />
				</main>

				{/* Sugestões rápidas de treino & compra */}
				{messages.length <= 3 && !isLoading && (
					<div className="px-4 py-2 border-t border-neutral-800/60 bg-neutral-950/50">
						<p className="text-[11px] text-neutral-400 mb-1.5 flex items-center gap-1 font-sans">
							<Flame className="w-3 h-3 text-orange-500" /> Sugestões rápidas:
						</p>
						<div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
							{QUICK_PROMPTS.map((item, idx) => (
								<button
									key={idx}
									onClick={() => {
										setInput(item.text);
										textareaRef.current?.focus();
									}}
									className="whitespace-nowrap shrink-0 text-[11px] bg-neutral-800/90 hover:bg-neutral-700 active:scale-95 transition-all text-neutral-300 px-2.5 py-1.5 rounded-full border border-neutral-700 cursor-pointer font-sans">
									{item.label}
								</button>
							))}
						</div>
					</div>
				)}

				{/* Input Footer */}
				<footer className="p-3 bg-neutral-950 border-t border-neutral-800">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleSend();
						}}
						className="flex items-end gap-2 bg-neutral-900 border border-neutral-700/80 rounded-2xl p-1.5 focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500/50 transition-all">
						<textarea
							ref={textareaRef}
							value={input}
							onChange={(e) => {
								setInput(e.target.value);
								e.target.style.height = "auto";
								e.target.style.height = `${Math.min(
									e.target.scrollHeight,
									120,
								)}px`;
							}}
							onKeyDown={handleKeyDown}
							placeholder="Pergunte sobre um treino ou peça indicação de compra..."
							rows={1}
							className="flex-1 bg-transparent text-sm text-neutral-100 placeholder-neutral-500 px-2 py-1.5 resize-none focus:outline-none max-h-28 text-[14px] font-sans"
						/>

						<button
							type="button"
							onClick={() => handleSend()}
							disabled={!input.trim() || isLoading}
							aria-label="Enviar mensagem"
							className={`p-3 rounded-xl transition-all flex items-center justify-center shrink-0 cursor-pointer ${
								input.trim() && !isLoading
									? "bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/30 active:scale-95"
									: "bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50 pointer-events-none"
							}`}>
							<Send className="w-4 h-4" />
						</button>
					</form>
				</footer>
			</div>
		</div>
	);
}
