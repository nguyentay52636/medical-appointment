import { useEffect, useState, useRef } from "react";
import { fetchChatResponse } from "../../service/aiService";

export default function AssistantAI({ embedded = false }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]); // { role: 'user'|'system', text }
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);

    const messagesRef = useRef(null);

    useEffect(() => {
        // initialize or restore session id (use sessionStorage to clear on page close)
        let sid = sessionStorage.getItem('ai_session_id');
        if (!sid) {
            sid = 'sid-' + Date.now() + '-' + Math.random().toString(36).slice(2,9);
            sessionStorage.setItem('ai_session_id', sid);
        }
        setSessionId(sid);
    }, []);

    useEffect(() => {
        // scroll messages container to bottom on new messages
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages]);

    // persist/load messages per session (use sessionStorage to clear on page close)
    useEffect(() => {
        if (!sessionId) return;
        const key = `ai_messages_${sessionId}`;
        try {
            const raw = sessionStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    setMessages(parsed);
                }
            }
        } catch (e) {
            console.warn('Failed to load chat history', e);
        }
    }, [sessionId]);

    useEffect(() => {
        if (!sessionId) return;
        const key = `ai_messages_${sessionId}`;
        try {
            sessionStorage.setItem(key, JSON.stringify(messages));
        } catch (e) {
            console.warn('Failed to save chat history', e);
        }
    }, [messages, sessionId]);

    const sendMessage = async () => {
        const text = input.trim();
        if (!text) return;

        // keep previous messages as history (do NOT include the current message in the history payload,
        // the backend will receive the current message separately)
        const prevMessages = messages;
        const newMessages = [...prevMessages, { role: "user", text }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        // build history strings in the format the backend expects
        const history = prevMessages.map((m) => {
            return (m.role === 'system' ? 'Assistant: ' : 'User: ') + m.text;
        });

        try {
            const res = await fetchChatResponse(text, sessionId, history);
            const answer = res && (res.answer || res.data || res);
            const replyText = typeof answer === "string" ? answer : JSON.stringify(answer);
            setMessages((m) => [...m, { role: "system", text: replyText }]);
        } catch (err) {
            console.error("Chat API error", err);
            setMessages((m) => [...m, { role: "system", text: "Đã có lỗi khi gọi trợ lý. Vui lòng thử lại." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className={`${embedded ? 'h-full' : 'min-h-screen'} bg-gradient-to-r from-white via-blue-50 to-gray-100 flex flex-col ${embedded ? '' : 'items-center justify-start'} ${embedded ? 'py-2 px-3 lg:px-6' : 'py-6 px-4 lg:px-20'}`}>
            <div className={`w-full max-w-4xl ${embedded ? 'mb-2' : 'mb-8'} text-center`}>
                <h2 className={`${embedded ? 'text-lg' : 'text-3xl'} font-extrabold text-gray-800 mb-2`}>Trợ lý AI Hỗ trợ tìm kiếm bác sĩ </h2>
            </div>

            <div className="w-full max-w-4xl bg-white rounded-xl shadow p-3 flex flex-col h-[62vh]">
                <div ref={messagesRef} className={`flex-1 overflow-auto p-4 space-y-4 bg-gray-50 rounded flex flex-col`}>
                    {messages.length === 0 && (
                        <div className="text-center text-gray-500">Bắt đầu cuộc trò chuyện với trợ lý AI...</div>
                    )}

                    {messages.map((m, idx) => (
                        <div key={idx} className={`flex ${m.role === 'system' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`${m.role === 'system' ? 'bg-white text-gray-800 border' :'bg-blue-600 text-white' } max-w-[80%] p-3 rounded-lg shadow`}>
                                <div className="whitespace-pre-wrap">{m.text}</div>
                            </div>
                        </div>
                    ))}

                    <div />
                </div>

                <div className="mt-4 flex gap-2 flex-none">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nhập câu hỏi... (Enter gửi, Shift+Enter xuống dòng)"
                        className="flex-1 p-3 rounded-lg border resize-none h-20"
                    />

                    <button
                        onClick={sendMessage}
                        disabled={loading || input.trim() === ""}
                        className={`px-6 py-3 rounded-lg text-white ${loading || input.trim() === '' ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
                        {loading ? 'Đang xử lý tin nhắn...' : 'Gửi'}
                    </button>
                </div>
            </div>
        </div>
    );
}