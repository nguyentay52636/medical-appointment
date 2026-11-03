import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTriageConsultAI } from "../../service/aiService";
import crmDictionary from "../../data/medicalSpecialtyDictionary.json";

// Component hiển thị văn bản y khoa sạch:
// - Loại bỏ hoàn toàn các ký tự thô như **, *, #, backticks
// - Định dạng các tiêu đề/từ khóa in đậm trang nhã, không dính ký tự **
// - Loại bỏ emoji tự do từ AI để giao diện luôn chuẩn mực, ngăn nắp, chuẩn y khoa
function FormattedClinicalText({ text, className = "" }) {
    if (!text) return null;

    // Loại bỏ emoji tự do để giữ giao diện chuẩn mực
    const cleanStr = String(text).replace(
        /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E0}-\u{1F1FF}]/gu,
        ''
    );

    const paragraphs = cleanStr
        .split(/\r?\n+/)
        .map((p) => p.trim())
        .filter(Boolean);

    return (
        <div className={`space-y-2 text-slate-700 text-sm leading-relaxed ${className}`}>
            {paragraphs.map((para, pIdx) => {
                // Xóa ký tự gạch đầu dòng markdown nếu có
                const cleanPara = para.replace(/^[#\*\-\+\•\s]{1,4}/, '').trim();
                // Phân tích cú pháp **từ khóa**
                const parts = cleanPara.split(/(\*\*.*?\*\*)/g);

                return (
                    <p key={pIdx}>
                        {parts.map((part, idx) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                                const inner = part.slice(2, -2).trim();
                                return (
                                    <strong key={idx} className="font-semibold text-slate-900">
                                        {inner}
                                    </strong>
                                );
                            }
                            return part;
                        })}
                    </p>
                );
            })}
        </div>
    );
}

// Bộ icon SVG chuẩn y tế (thay thế emoji ngẫu hứng)
const Icons = {
    Cross: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
    ),
    Stethoscope: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
    ),
    Activity: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l3 8 4-16 3 8h4" />
        </svg>
    ),
    Hospital: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
    ),
    ShieldCheck: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
    ),
    AlertTriangle: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    ),
    HelpCircle: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.451 1.827v.75M12 18h.01" />
        </svg>
    ),
    BookOpen: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
    ),
    User: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    Send: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
    ),
    ArrowRight: () => (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
    ),
    Search: () => (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    )
};

export default function AssistantAI({ embedded = false }) {
    const navigate = useNavigate();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCrmModal, setShowCrmModal] = useState(false);
    const [crmSearch, setCrmSearch] = useState("");
    const [selectedSpecialtyTab, setSelectedSpecialtyTab] = useState(null);

    const messagesRef = useRef(null);

    // Mẫu triệu chứng lâm sàng chuẩn y khoa
    const SAMPLE_SYMPTOMS = [
        {
            specialty: "Nội khoa",
            label: "Mất ngủ, đau đầu & mệt mỏi",
            text: "Tôi thường xuyên mất ngủ, đau đầu và cảm thấy mệt mỏi. Tôi nên làm gì?"
        },
        {
            specialty: "Tim mạch",
            label: "Đau tức ngực, hồi hộp, tim đập nhanh",
            text: "Tôi bị đau tức ngực, hồi hộp, tim đập nhanh và khó thở khi vận động."
        },
        {
            specialty: "Tai Mũi Họng",
            label: "Đau rát họng, ho có đờm",
            text: "Tôi bị đau rát họng, nuốt buốt, ho kéo dài và sổ mũi 3 ngày nay."
        },
        {
            specialty: "Da liễu",
            label: "Ngứa da, nổi mề đay, mẩn đỏ",
            text: "Da tôi nổi mẩn đỏ, ngứa ngáy dữ dội khắp người sau khi ăn hải sản."
        },
        {
            specialty: "Nhi khoa",
            label: "Trẻ sốt cao, quấy khóc, biếng ăn",
            text: "Bé nhà tôi 2 tuổi bị sốt cao 39 độ, ho nhẹ và quấy khóc, biếng ăn."
        }
    ];

    useEffect(() => {
        let sid = sessionStorage.getItem('ai_session_id');
        if (!sid) {
            sid = 'sid-' + Date.now() + '-' + Math.random().toString(36).slice(2, 9);
            sessionStorage.setItem('ai_session_id', sid);
        }
        setSessionId(sid);
    }, []);

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [messages, loading]);

    useEffect(() => {
        if (!sessionId) return;
        const key = `ai_messages_triage_${sessionId}`;
        try {
            const raw = sessionStorage.getItem(key);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                }
            }
        } catch (e) {
            console.warn('Failed to load chat history', e);
        }
    }, [sessionId]);

    useEffect(() => {
        if (!sessionId || messages.length === 0) return;
        const key = `ai_messages_triage_${sessionId}`;
        try {
            sessionStorage.setItem(key, JSON.stringify(messages));
        } catch (e) {
            console.warn('Failed to save chat history', e);
        }
    }, [messages, sessionId]);

    const handleSendMessage = async (queryText = null) => {
        const text = (queryText || input).trim();
        if (!text || loading) return;

        const prevMessages = messages;
        const newMessages = [...prevMessages, { role: "user", text }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        const history = prevMessages.map((m) => {
            return (m.role === 'system' ? 'Assistant: ' : 'User: ') + (m.text || m.triageData?.analysis || "");
        });

        try {
            const triageRes = await fetchTriageConsultAI(text, sessionId, history);
            setMessages((m) => [
                ...m,
                {
                    role: "system",
                    text: triageRes.analysis,
                    triageData: triageRes
                }
            ]);
        } catch (err) {
            console.error("AI Triage API error", err);
            setMessages((m) => [
                ...m,
                {
                    role: "system",
                    text: "Hệ thống tạm thời bận xử lý hoặc kết nối bị gián đoạn. Vui lòng thử lại sau giây lát hoặc liên hệ nhân viên tiếp đón phòng khám để được phân luồng trực tiếp."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleBookDoctor = (doc) => {
        const patient = sessionStorage.getItem("patient");
        if (!patient) {
            alert("Vui lòng đăng nhập tài khoản bệnh nhân để tiến hành đặt lịch khám.");
            navigate("/patient/login");
            return;
        }
        navigate("/patient/booking", { state: { doctor: doc } });
    };

    const handleFilterSpecialtyDoctors = (specialtyName) => {
        navigate(`/patient/doctor_list?specialty=${encodeURIComponent(specialtyName)}`);
    };

    const filteredCrmSpecialties = (crmDictionary?.specialties || []).filter((s) => {
        if (!crmSearch) return true;
        const q = crmSearch.toLowerCase();
        return (
            s.specialtyName.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.keywords.some((k) => k.toLowerCase().includes(q)) ||
            s.commonConditions.some((c) => c.toLowerCase().includes(q))
        );
    });

    return (
        <div className={`${embedded ? 'h-full' : 'min-h-screen py-8 px-4 lg:px-12'} bg-slate-50 flex flex-col items-center justify-start`}>
            {/* Thanh tiêu đề chuyên nghiệp */}
            <div className="w-full max-w-5xl mb-4 flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 md:p-5 rounded-2xl shadow-xs border border-slate-200">
                <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                        <Icons.Cross />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                                MediCare Clinical Triage
                            </h1>
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                                Sàng Lọc & Phân Luồng Chuyên Khoa
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Phân tích lâm sàng dựa trên từ điển tri thức chuyên khoa và trợ lý AI thông minh
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                        onClick={() => setShowCrmModal(true)}
                        className="px-3.5 py-2 text-xs md:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-2 border border-slate-200 cursor-pointer"
                        title="Xem toàn bộ từ điển từ khóa bệnh lý và chuyên khoa độc lập"
                    >
                        <Icons.BookOpen />
                        <span>Từ Điển Tri Thức CRM</span>
                    </button>
                    {messages.length > 0 && (
                        <button
                            onClick={() => {
                                if (window.confirm("Bạn có chắc muốn làm mới phiên tư vấn này?")) {
                                    sessionStorage.removeItem(`ai_messages_triage_${sessionId}`);
                                    setMessages([]);
                                }
                            }}
                            className="px-3 py-2 text-xs md:text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-slate-200 cursor-pointer"
                            title="Xóa cuộc trò chuyện hiện tại"
                        >
                            Làm mới
                        </button>
                    )}
                </div>
            </div>

            {/* Khung chat chính */}
            <div className={`w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col ${embedded ? 'h-[72vh]' : 'h-[76vh]'} overflow-hidden`}>
                {/* Khu vực cuộn tin nhắn */}
                <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/50">
                    {/* Welcome Banner */}
                    {messages.length === 0 && (
                        <div className="py-8 px-4 text-center max-w-2xl mx-auto space-y-5">
                            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-xs">
                                <Icons.Activity />
                            </div>
                            <div className="space-y-1.5">
                                <h2 className="text-lg md:text-xl font-bold text-slate-900">
                                    Hệ thống Hỗ trợ Sàng lọc & Phân Luồng Y tế
                                </h2>
                                <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                                    Mô tả triệu chứng sức khỏe bạn đang gặp phải. Hệ thống sẽ đối chiếu với từ điển chuyên khoa,
                                    đánh giá mức độ ưu tiên lâm sàng và gợi ý các hướng xử lý bước đầu an toàn.
                                </p>
                            </div>

                            {/* Gợi ý triệu chứng mẫu chuẩn mực */}
                            <div className="pt-2 text-left space-y-2">
                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    Tình trạng mẫu tham khảo nhanh:
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {SAMPLE_SYMPTOMS.map((s, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSendMessage(s.text)}
                                            className="p-3 text-left bg-white hover:bg-blue-50/70 hover:border-blue-300 rounded-xl border border-slate-200 shadow-2xs transition flex flex-col gap-1 group cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                                    {s.specialty}
                                                </span>
                                                <Icons.ArrowRight />
                                            </div>
                                            <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700">
                                                {s.label}
                                            </div>
                                            <div className="text-[11px] text-slate-500 line-clamp-1">
                                                {s.text}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Danh sách tin nhắn */}
                    {messages.map((m, idx) => (
                        <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {m.role === 'user' ? (
                                <div className="max-w-[85%] sm:max-w-[75%] bg-slate-900 text-white p-4 rounded-2xl rounded-tr-none shadow-xs">
                                    <div className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                                        <Icons.User />
                                        <span>Bạn đã mô tả</span>
                                    </div>
                                    <div className="text-sm md:text-base whitespace-pre-wrap leading-relaxed font-normal">
                                        {m.text}
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-[92%] sm:max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-xs overflow-hidden">
                                    {/* Header phiên phân tích */}
                                    <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center">
                                                <Icons.Cross />
                                            </div>
                                            <span className="text-xs font-bold text-slate-800">
                                                Kết quả Sàng lọc Lâm sàng
                                            </span>
                                            {m.triageData?.consultationSource && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                                    m.triageData.consultationSource === 'AI_LLM_ONLINE'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                                                }`}>
                                                    {m.triageData.consultationSource === 'AI_LLM_ONLINE'
                                                        ? `AI Trực tuyến (${m.triageData.aiModelUsed || 'Gemma/Nemotron'})`
                                                        : 'Chuẩn Từ Điển CRM'}
                                                </span>
                                            )}
                                        </div>
                                        {m.triageData?.urgencyLevel && (
                                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1.5 ${
                                                m.triageData.urgencyLevel === 'EMERGENCY'
                                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                                    : m.triageData.urgencyLevel === 'ATTENTION'
                                                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            }`}>
                                                {m.triageData.urgencyLevel === 'EMERGENCY' ? (
                                                    <>
                                                        <Icons.AlertTriangle />
                                                        <span>Cần Chú Ý Khẩn Cấp</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Icons.ShieldCheck />
                                                        <span>Tư Vấn Thường Quy</span>
                                                    </>
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {/* Khối dữ liệu kết quả phân tầng rõ ràng */}
                                    <div className="p-5 space-y-5 text-slate-800 text-sm">
                                        {/* 1. Đánh giá sơ bộ */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
                                                <Icons.Activity />
                                                <span>Đánh Giá Triệu Chứng Lâm Sàng</span>
                                            </div>
                                            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                                                <FormattedClinicalText
                                                    text={m.triageData?.analysis || m.text}
                                                />
                                            </div>
                                        </div>

                                        {/* 2. Chuyên khoa đề xuất */}
                                        {m.triageData?.recommendedSpecialties && m.triageData.recommendedSpecialties.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
                                                    <Icons.Hospital />
                                                    <span>Chuyên Khoa Đề Xuất Phù Hợp</span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2.5">
                                                    {m.triageData.recommendedSpecialties.map((spec, sIdx) => (
                                                        <div
                                                            key={sIdx}
                                                            className="p-3.5 bg-white border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-slate-900 text-base">
                                                                        {spec.specialtyName}
                                                                    </span>
                                                                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium border border-blue-100">
                                                                        {spec.matchScore}% Độ tương thích
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                                    {spec.reason}
                                                                </p>
                                                            </div>

                                                            <div className="flex-shrink-0">
                                                                <button
                                                                    onClick={() => handleFilterSpecialtyDoctors(spec.specialtyName)}
                                                                    className="w-full sm:w-auto px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                                                >
                                                                    <span>Đặt khám khoa này</span>
                                                                    <Icons.ArrowRight />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 3. Ba hướng xử lý khuyến nghị */}
                                        {m.triageData?.actionSteps && m.triageData.actionSteps.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
                                                    <Icons.ShieldCheck />
                                                    <span>Hướng Xử Lý Khuyến Nghị</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {m.triageData.actionSteps.map((step, stepIdx) => (
                                                        <div
                                                            key={stepIdx}
                                                            className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3 shadow-2xs"
                                                        >
                                                            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                {stepIdx + 1}
                                                            </span>
                                                            <div className="text-xs md:text-sm text-slate-700 leading-relaxed">
                                                                <FormattedClinicalText text={step} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 4. Câu hỏi làm rõ triệu chứng */}
                                        {m.triageData?.followUpQuestions && m.triageData.followUpQuestions.length > 0 && (
                                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                                <div className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
                                                    <Icons.HelpCircle />
                                                    <span>Câu Hỏi Làm Rõ Triệu Chứng</span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    Nhấn vào câu hỏi bên dưới nếu bạn muốn mô tả chi tiết hơn:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {m.triageData.followUpQuestions.map((q, qIdx) => (
                                                        <button
                                                            key={qIdx}
                                                            onClick={() => handleSendMessage(q)}
                                                            className="text-left text-xs px-3.5 py-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 rounded-xl transition cursor-pointer flex items-center gap-1.5"
                                                        >
                                                            <span>{q}</span>
                                                            <Icons.ArrowRight />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 5. Bác sĩ phụ trách lịch khám */}
                                        {m.triageData?.suggestedDoctors && m.triageData.suggestedDoctors.length > 0 && (
                                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-1.5 text-slate-700 font-bold text-xs uppercase tracking-wider">
                                                        <Icons.User />
                                                        <span>Bác Sĩ Chuyên Khoa Đang Có Lịch Khám</span>
                                                    </span>
                                                    <button
                                                        onClick={() => navigate("/patient/doctor_list")}
                                                        className="text-xs text-blue-600 hover:underline cursor-pointer"
                                                    >
                                                        Xem toàn bộ danh sách
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {m.triageData.suggestedDoctors.slice(0, 2).map((doc) => (
                                                        <div
                                                            key={doc.id}
                                                            className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs"
                                                        >
                                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                                <img
                                                                    src={doc.imageUrl || "https://i.pravatar.cc/150"}
                                                                    alt={doc.fullName}
                                                                    className="w-11 h-11 rounded-full object-cover border border-slate-200 flex-shrink-0"
                                                                />
                                                                <div className="overflow-hidden">
                                                                    <div className="text-xs font-bold text-slate-800 truncate">
                                                                        {doc.fullName}
                                                                    </div>
                                                                    <div className="text-[11px] text-blue-600 font-medium truncate">
                                                                        {doc.specialtyName} • {doc.experienceYears || 5} năm kinh nghiệm
                                                                    </div>
                                                                    <div className="text-[11px] text-slate-500">
                                                                        {(doc.pricePerAppointment || 200000).toLocaleString('vi-VN')} đ/lượt
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => handleBookDoctor(doc)}
                                                                className="px-3 py-1.5 bg-slate-900 hover:bg-blue-600 text-white rounded-lg text-xs font-medium flex-shrink-0 transition cursor-pointer"
                                                            >
                                                                Đặt khám
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Trạng thái tải */}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-3">
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs text-slate-600">
                                    Đang phân tích lâm sàng và đối chiếu với từ điển chuyên khoa...
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Thanh nhập tin nhắn */}
                <div className="p-3 md:p-4 bg-white border-t border-slate-200 flex-none space-y-2.5">
                    {/* Chip triệu chứng gợi ý nhanh */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-600 scrollbar-none">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase flex-shrink-0">
                            Gợi ý:
                        </span>
                        {SAMPLE_SYMPTOMS.map((s, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSendMessage(s.text)}
                                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 flex-shrink-0 transition cursor-pointer text-[11px]"
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Nhập triệu chứng của bạn (ví dụ: đau đầu kéo dài, sốt nhẹ, đau tức ngực...)"
                            rows={2}
                            className="flex-1 p-3 text-xs md:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none transition"
                        />

                        <button
                            onClick={() => handleSendMessage()}
                            disabled={loading || input.trim() === ""}
                            className={`px-5 md:px-6 rounded-xl text-white font-medium text-xs md:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                loading || input.trim() === ""
                                    ? 'bg-slate-300 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
                            }`}
                        >
                            <span>Gửi</span>
                            <Icons.Send />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Tra Cứu Từ Điển Tri Thức CRM */}
            {showCrmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-xl flex flex-col overflow-hidden border border-slate-200">
                        {/* Header Modal */}
                        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                    <Icons.BookOpen />
                                </div>
                                <div>
                                    <h3 className="font-bold text-base md:text-lg">
                                        Từ Điển Tri Thức Chuyên Khoa Y Tế
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Cấu hình JSON độc lập: <code className="text-blue-300">medical_specialty_crm_rules.json</code>
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCrmModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Search & Filter */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <div className="relative w-full sm:w-80">
                                <input
                                    type="text"
                                    value={crmSearch}
                                    onChange={(e) => setCrmSearch(e.target.value)}
                                    placeholder="Tìm triệu chứng, bệnh lý..."
                                    className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                />
                                <span className="absolute left-3 top-2.5 text-slate-400">
                                    <Icons.Search />
                                </span>
                            </div>

                            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                                <button
                                    onClick={() => setSelectedSpecialtyTab(null)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                        selectedSpecialtyTab === null
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    Tất cả ({filteredCrmSpecialties.length})
                                </button>
                                {filteredCrmSpecialties.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedSpecialtyTab(s.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex-shrink-0 ${
                                            selectedSpecialtyTab === s.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        {s.specialtyName}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Danh sách chuyên khoa */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            {filteredCrmSpecialties
                                .filter((s) => selectedSpecialtyTab === null || s.id === selectedSpecialtyTab)
                                .map((s) => (
                                    <div
                                        key={s.id}
                                        className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-base md:text-lg text-slate-900">
                                                        {s.specialtyName}
                                                    </span>
                                                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold uppercase border border-blue-100">
                                                        {s.departmentCode}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        Mã: #{s.id}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {s.description}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setShowCrmModal(false);
                                                    handleSendMessage(`Tôi muốn tư vấn về các triệu chứng thuộc chuyên khoa ${s.specialtyName}`);
                                                }}
                                                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition self-start sm:self-auto cursor-pointer"
                                            >
                                                Tư vấn chuyên khoa này
                                            </button>
                                        </div>

                                        {/* Từ khóa nhận diện */}
                                        <div className="space-y-1.5">
                                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                Từ khóa triệu chứng nhận diện ({s.keywords.length})
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {s.keywords.map((kw, kwIdx) => (
                                                    <span
                                                        key={kwIdx}
                                                        className="text-[11px] px-2.5 py-0.5 bg-slate-50 text-slate-700 rounded-md border border-slate-200"
                                                    >
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bệnh lý thường gặp */}
                                        <div className="space-y-1.5">
                                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                                Bệnh lý thường gặp liên quan
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                                                {s.commonConditions.map((cond, cIdx) => (
                                                    <div key={cIdx} className="flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                        <span>{cond}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 3 Hướng xử lý */}
                                        <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                            <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                                Hướng xử lý chuẩn hóa
                                            </div>
                                            <div className="space-y-1 text-xs text-slate-600">
                                                {s.standardHandlingDirections.map((dir, dIdx) => (
                                                    <div key={dIdx} className="flex items-start gap-2">
                                                        <span className="font-bold text-blue-600 flex-shrink-0">
                                                            {dIdx + 1}.
                                                        </span>
                                                        <span>{dir}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                            <span>
                                Tệp tri thức JSON độc lập quản lý tập trung toàn bộ luật lâm sàng của cơ sở y tế.
                            </span>
                            <button
                                onClick={() => setShowCrmModal(false)}
                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition cursor-pointer"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}