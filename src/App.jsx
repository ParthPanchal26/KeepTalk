import React, { useEffect, useRef, useState } from 'react'
import Groq from "groq-sdk";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const App = () => {

  const [messages, setMessages] = useState([
    { text: "Hello! How can I help you today?", sender: "bot" }
  ]);

  const [input, setInput] = useState("");

  let aiResponse = "";

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage = { text: input, sender: "user" };
    const updatedMessages = [...messages, newMessage];

    setMessages(updatedMessages);
    setInput("");

    try {
      const chatCompletion = await getGroqChatCompletion(updatedMessages);
      aiResponse = chatCompletion.choices[0]?.message?.content
        .replace(/\n{2,}/g, "\n\n")
        .replace(/\n/g, "  \n") || "I'm not sure how to respond.";

      setMessages(prev => [...prev, { text: aiResponse, sender: "bot" }]);
    } catch (error) {
      console.error("Error getting response:", error);
      setMessages(prev => [...prev, { text: "Error: Unable to get response.", sender: "bot" }]);
    }
  };


  const groq = new Groq({ apiKey: import.meta.env.VITE_GROQ_API_KEY, dangerouslyAllowBrowser: true, });

  async function getGroqChatCompletion(messages) {
    return groq.chat.completions.create({
      messages: messages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      })),
      model: "llama-3.3-70b-versatile",
    });
  }

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert("Copied to clipboard! ✅");
  };

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  return (
    <div className="flex flex-col h-[95vh] bg-gray-100 p-4 max-w-md mx-auto">
      <div className="flex-1 overflow-y-auto space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`px-3 py-2 rounded-lg tracking-wide leading-7 ${msg.sender === "user" ? "bg-slate-800 max-w-[75%] font-semibold border-r-6 border-gray-500 text-white ml-26 transition hover:bg-slate-900" : "bg-gray-700 text-white border-l-6 border-slate-800 self-start max-w-[95%] transition hover:bg-gray-600"}`}
          >
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-3 text-justify">{children}</p>,
                span: ({ children }) => <span className="mb-3 text-justify">{children}</span>,
                div: ({ children }) => <div className="mb-3 text-justify">{children}</div>,
                h1: ({ children }) => <h1 className="mb-3 text-justify">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-3 text-justify">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-3 text-justify">{children}</h3>,
                h4: ({ children }) => <h4 className="mb-3 text-justify">{children}</h4>,
                pre: ({ children }) => <pre className="mb-3 text-justify">{children}</pre>,
                code({ inline, className, children }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeContent = String(children).trim();
                  return !inline && match ? (
                    <div className="relative">
                      <button
                        onClick={() => copyToClipboard(codeContent)}
                        className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 text-sm rounded hover:bg-gray-900"
                      >
                        Copy
                      </button>
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-sm"
                      >
                        {codeContent}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    <code className="bg-gray-800 text-white p-1 rounded-sm">{children}</code>
                  );
                },
              }}
            >
              {msg.text}
            </ReactMarkdown>
          </div>
        ))}
        <div ref={messagesEndRef}></div>
      </div>
      <div className="flex gap-2 p-2 rounded-lg">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border-2 rounded-sm outline-0 rounded-r-none border-r-0 font-medium"
          placeholder="Type here!"
        />
        <button onClick={sendMessage} className="bg-gray-700 ml-[-8px] text-white px-6 py-2 rounded-sm rounded-l-none transition-all hover:bg-slate-950 font-semibold">Send</button>
      </div>
    </div>
  );
}

export default App