"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { MessageCircle, Send, X } from "lucide-react";

interface ChatMessage {
  id: number;
  sender: "assistant" | "user";
  text: string;
}

const seedMessages: ChatMessage[] = [
  {
    id: 1,
    sender: "assistant",
    text: "¡Hola! Estoy aquí para ayudarte con cualquier pregunta que tengas sobre nuestros productos, tallas, pedidos y más. ¿Cómo puedo asistirte hoy?",
  },
  {
    id: 2,
    sender: "user",
    text: "¿Cuáles son las últimas tendencias en la moda femenina?",
  },
  {
    id: 3,
    sender: "assistant",
    text: "Esta temporada, estamos viendo muchos colores llamativos, siluetas oversize y materiales sostenibles. Piensa en vestidos vibrantes, pantalones de pierna ancha y telas ecológicas. ¿Quieres que te muestre algunos ejemplos?",
  },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const bubbleLabel = useMemo(
    () => (isOpen ? "Cerrar chat" : "Abrir chat"),
    [isOpen]
  );

  const toggleWidget = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, isOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMessage: ChatMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmed,
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextHistory.map(({ sender, text }) => ({
            role: sender,
            content: text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("La API respondió con un estado no exitoso.");
      }

      const data: { reply?: string } = await response.json();
      const assistantReply = data.reply?.trim();

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "assistant",
          text:
            assistantReply && assistantReply.length > 0
              ? assistantReply
              : "Lo siento, ahora mismo no tengo una respuesta disponible.",
        },
      ]);
    } catch (error) {
      console.error("[ChatWidget] Error al enviar el mensaje", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          sender: "assistant",
          text: "Hubo un inconveniente al conectar con el asistente. Por favor, inténtalo nuevamente en unos minutos.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-80 sm:w-96 rounded-3xl shadow-2xl border border-slate-200 bg-white overflow-hidden">
          <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Pregunta lo que quieras
              </p>
              <p className="text-xs text-slate-500">
                StyleHub AI responde en segundos
              </p>
            </div>
            <button
              type="button"
              onClick={toggleWidget}
              aria-label="Cerrar chat"
              className="rounded-full p-1.5 text-slate-500 hover:text-slate-700 hover:bg-white/60 transition"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="flex flex-col gap-4 px-5 py-4 max-h-96 overflow-y-auto bg-slate-50/60">
            {messages.map((message) => {
              const isUser = message.sender === "user";
              return (
                <div
                  key={message.id}
                  className={clsx("flex items-start gap-3", {
                    "justify-end": isUser,
                  })}
                >
                  {!isUser && (
                    <img
                      src="https://i.pravatar.cc/80?img=47"
                      alt="StyleHub AI"
                      className="h-8 w-8 rounded-full object-cover shadow-sm"
                    />
                  )}
                  <div
                    className={clsx(
                      "rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
                      isUser
                        ? "bg-[#2F6CFF] text-white"
                        : "bg-white text-slate-700 border border-slate-100"
                    )}
                  >
                    <p className="whitespace-pre-line">{message.text}</p>
                  </div>
                  {isUser && (
                    <img
                      src="https://i.pravatar.cc/80?img=58"
                      alt="Cliente"
                      className="h-8 w-8 rounded-full object-cover shadow-sm"
                    />
                  )}
                </div>
              );
            })}
            {isLoading && (
              <div className="flex items-start gap-3">
                <img
                  src="https://i.pravatar.cc/80?img=47"
                  alt="StyleHub AI"
                  className="h-8 w-8 rounded-full object-cover shadow-sm"
                />
                <div className="rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm bg-white text-slate-500 border border-slate-100">
                  StyleHub AI está escribiendo...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-200 bg-white px-5 py-4"
          >
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Escribe tu pregunta aquí..."
                className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                aria-label="Tu mensaje"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2F6CFF] text-white shadow-sm transition hover:bg-[#1E4ED8] disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Enviar mensaje"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={toggleWidget}
        aria-label={bubbleLabel}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#2F6CFF] to-[#3EA1FE] text-white shadow-xl transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2F6CFF]"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}
