import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchTriageConsultAI } from "../../service/aiService";
import crmDictionary from "../../data/medicalSpecialtyDictionary.json";

export default function AssistantAI({ embedded = false }) {
    const navigate = useNavigate();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]); // { role: 'user'|'system', text, triageData }
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCrmModal, setShowCrmModal] = useState(false);
    const [crmSearch, setCrmSearch] = useState("");
    const [selectedSpecialtyTab, setSelectedSpecialtyTab] = useState(null);

    const messagesRef = useRef(null);

    // Mẫu câu hỏi triệu chứng thông dụng theo CRM
    const SAMPLE_SYMPTOMS = [
        {
            label: "Mất ngủ, đau đầu & mệt mỏi",
            text: "Tôi thường xuyên mất ngủ, đau đầu và cảm thấy mệt mỏi. Tôi nên làm gì?",
            icon: "💤"
        },
        {
            label: "Đau ngực, tim đập nhanh",
            text: "Tôi bị đau tức ngực, hồi hộp, tim đập nhanh và khó thở khi vận động.",
            icon: "❤️"
        },
        {
            label: "Đau họng, ho có đờm",
            text: "Tôi bị đau rát họng, nuốt buốt, ho kéo dài và sổ mũi 3 ngày nay.",
            icon: "🗣️"
        },
        {
            label: "Ngứa da, nổi mề đay",
            text: "Da tôi nổi mẩn đỏ, ngứa ngáy dữ dội khắp người sau khi ăn hải sản.",
            icon: "🧴"
        },
        {
            label: "Bé sốt cao, biếng ăn",
            text: "Bé nhà tôi 2 tuổi bị sốt cao 39 độ, ho nhẹ và quấy khóc, biếng ăn.",
            icon: "👶"
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
                    text: "Hệ thống đang bận xử lý hoặc kết nối gián đoạn. Vui lòng thử lại sau giây lát hoặc liên hệ hotline phòng khám để được hỗ trợ trực tiếp."
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
            alert("Vui lòng đăng nhập tài khoản bệnh nhân để tiến hành đặt lịch khám!");
            navigate("/patient/login");
            return;
        }
        navigate("/patient/booking", { state: { doctor: doc } });
    };

    const handleFilterSpecialtyDoctors = (specialtyName) => {
        navigate(`/patient/doctor_list?specialty=${encodeURIComponent(specialtyName)}`);
    };

    // Lọc chuyên khoa trong từ điển CRM
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
            {/* Header thông tin */}
            <div className="w-full max-w-5xl mb-4 flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-md shadow-blue-500/20">
                        🤖
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                            MediCare AI Consultant
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold border border-blue-200">
                                Sàng Lọc & Phân Luồng Chuyên Khoa
                            </span>
                        </h1>
                        <p className="text-xs md:text-sm text-slate-500">
                            Phân tích triệu chứng lâm sàng • Khuyến nghị chuyên khoa chính xác • 3 Hướng xử lý tại nhà
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    <button
                        onClick={() => setShowCrmModal(true)}
                        className="px-3.5 py-2 text-xs md:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 border border-slate-300 shadow-sm cursor-pointer"
                        title="Xem toàn bộ từ điển từ khóa bệnh lý và chuyên khoa độc lập"
                    >
                        <span>📖</span>
                        <span>Từ Điển CRM Tri Thức Y Khoa</span>
                    </button>
                    {messages.length > 0 && (
                        <button
                            onClick={() => {
                                if (window.confirm("Bạn có chắc muốn xóa lịch sử cuộc trò chuyện tư vấn này?")) {
                                    sessionStorage.removeItem(`ai_messages_triage_${sessionId}`);
                                    setMessages([]);
                                }
                            }}
                            className="px-3 py-2 text-xs md:text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200 cursor-pointer"
                            title="Xóa cuộc trò chuyện hiện tại"
                        >
                            Làm mới
                        </button>
                    )}
                </div>
            </div>

            {/* Khung chat chính */}
            <div className={`w-full max-w-5xl bg-white rounded-2xl shadow-lg border border-slate-200 flex flex-col ${embedded ? 'h-[72vh]' : 'h-[76vh]'} overflow-hidden`}>
                {/* Khu vực tin nhắn cuộn */}
                <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-slate-50/60">
                    {/* Welcome Banner nếu chưa có tin nhắn */}
                    {messages.length === 0 && (
                        <div className="py-8 px-4 text-center max-w-2xl mx-auto space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl shadow-inner border border-blue-100">
                                🩺
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">
                                Chào bạn! Bạn đang cảm thấy không khỏe ở đâu?
                            </h2>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Hãy mô tả các triệu chứng bạn đang gặp phải (ví dụ: đau đầu, mất ngủ, tức ngực, đau họng, nổi mẩn ngứa...).
                                Trợ lý AI sẽ phân tích nguyên nhân, gợi ý chuyên khoa cần khám và đưa ra 3 hướng xử lý an toàn.
                            </p>

                            {/* Gợi ý mẫu */}
                            <div className="pt-4 text-left">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                                    💡 Hoặc chọn nhanh tình trạng mẫu để thử nghiệm:
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {SAMPLE_SYMPTOMS.map((s, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSendMessage(s.text)}
                                            className="p-3 text-left bg-white hover:bg-blue-50 hover:border-blue-300 rounded-xl border border-slate-200 shadow-sm transition flex items-start gap-2.5 group cursor-pointer"
                                        >
                                            <span className="text-xl flex-shrink-0">{s.icon}</span>
                                            <div>
                                                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                                                    {s.label}
                                                </div>
                                                <div className="text-[11px] text-slate-500 line-clamp-1">
                                                    {s.text}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Danh sách tin nhắn */}
                    {messages.map((m, idx) => (
                        <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                            {m.role === 'user' ? (
                                <div className="max-w-[85%] sm:max-w-[75%] bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-2xl rounded-tr-none shadow-md shadow-blue-500/10">
                                    <div className="text-xs font-medium text-blue-200 mb-1 flex items-center gap-1.5">
                                        <span>👤 Người dùng</span>
                                    </div>
                                    <div className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                                        {m.text}
                                    </div>
                                </div>
                            ) : (
                                <div className="max-w-[92%] sm:max-w-[85%] bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm overflow-hidden">
                                    {/* System Header */}
                                    <div className="px-5 py-3 bg-gradient-to-r from-slate-100 to-blue-50 border-b border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs">
                                                🤖
                                            </span>
                                            <span className="text-xs font-bold text-slate-700">
                                                AI Medical Consultant
                                            </span>
                                        </div>
                                        {m.triageData?.urgencyLevel && (
                                            <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${m.triageData.urgencyLevel === 'EMERGENCY'
                                                    ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                                                    : m.triageData.urgencyLevel === 'ATTENTION'
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                }`}>
                                                {m.triageData.urgencyLevel === 'EMERGENCY' ? '🚨 Cần Chú Ý Đặc Biệt' : '📋 Tư Vấn Thường Quy'}
                                            </span>
                                        )}
                                    </div>

                                    {/* Thân câu trả lời có cấu trúc */}
                                    <div className="p-5 space-y-5 text-slate-800 text-sm">
                                        {/* 1. AI Phân tích vấn đề */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase tracking-wider">
                                                <span>🩺</span>
                                                <span>AI Phân Tích Vấn Đề</span>
                                            </div>
                                            <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-slate-700 leading-relaxed">
                                                {m.triageData?.analysis || m.text}
                                            </div>
                                        </div>

                                        {/* 2. Đề xuất Chuyên khoa Nên Khám (Nếu có) */}
                                        {m.triageData?.recommendedSpecialties && m.triageData.recommendedSpecialties.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
                                                    <span>🏥</span>
                                                    <span>Đề Xuất Chuyên Khoa Phù Hợp</span>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2.5">
                                                    {m.triageData.recommendedSpecialties.map((spec, sIdx) => (
                                                        <div
                                                            key={sIdx}
                                                            className="p-3.5 bg-gradient-to-r from-indigo-50/60 to-white border border-indigo-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                                                        >
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-bold text-indigo-900 text-base">
                                                                        {spec.specialtyName}
                                                                    </span>
                                                                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-semibold">
                                                                        {spec.matchScore}% Khớp triệu chứng
                                                                    </span>
                                                                </div>
                                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                                    {spec.reason}
                                                                </p>
                                                            </div>

                                                            <div className="flex-shrink-0">
                                                                <button
                                                                    onClick={() => handleFilterSpecialtyDoctors(spec.specialtyName)}
                                                                    className="w-full sm:w-auto px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1 cursor-pointer"
                                                                >
                                                                    <span>Đặt khám khoa này</span>
                                                                    <span>→</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 3. AI Đề xuất 3 hướng xử lý */}
                                        {m.triageData?.actionSteps && m.triageData.actionSteps.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                                                    <span>💡</span>
                                                    <span>AI Đề Xuất 3 Hướng Xử Lý</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {m.triageData.actionSteps.map((step, stepIdx) => (
                                                        <div
                                                            key={stepIdx}
                                                            className="p-3 bg-white border border-slate-200 rounded-xl flex items-start gap-3 shadow-2xs"
                                                        >
                                                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                {stepIdx + 1}
                                                            </span>
                                                            <span className="text-xs md:text-sm text-slate-700 leading-relaxed">
                                                                {step}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 4. AI Hỏi Thêm Để Tư Vấn Chính Xác Hơn */}
                                        {m.triageData?.followUpQuestions && m.triageData.followUpQuestions.length > 0 && (
                                            <div className="space-y-2 pt-1 border-t border-slate-100">
                                                <div className="flex items-center gap-2 text-purple-700 font-bold text-xs uppercase tracking-wider">
                                                    <span>❓</span>
                                                    <span>AI Hỏi Thêm Để Tư Vấn Chính Xác Hơn</span>
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    Bấm vào câu hỏi dưới đây nếu bạn muốn giải đáp tiếp tục:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {m.triageData.followUpQuestions.map((q, qIdx) => (
                                                        <button
                                                            key={qIdx}
                                                            onClick={() => handleSendMessage(q)}
                                                            className="text-left text-xs px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-xl transition cursor-pointer flex items-center gap-1.5 group"
                                                        >
                                                            <span className="text-purple-500 group-hover:scale-110 transition">💬</span>
                                                            <span>{q}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* 5. Gợi ý Bác Sĩ Tiêu Biểu Thuộc Khoa */}
                                        {m.triageData?.suggestedDoctors && m.triageData.suggestedDoctors.length > 0 && (
                                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                                <div className="flex items-center justify-between">
                                                    <span className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
                                                        <span>👨‍⚕️</span>
                                                        <span>Bác Sĩ Chuyên Khoa Đang Có Lịch Khám</span>
                                                    </span>
                                                    <button
                                                        onClick={() => navigate("/patient/doctor_list")}
                                                        className="text-xs text-blue-600 hover:underline"
                                                    >
                                                        Xem tất cả bác sĩ
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {m.triageData.suggestedDoctors.slice(0, 2).map((doc) => (
                                                        <div
                                                            key={doc.id}
                                                            className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                                                        >
                                                            <div className="flex items-center gap-2.5 overflow-hidden">
                                                                <img
                                                                    src={doc.imageUrl || "https://i.pravatar.cc/150"}
                                                                    alt={doc.fullName}
                                                                    className="w-11 h-11 rounded-full object-cover border border-blue-200 flex-shrink-0"
                                                                />
                                                                <div className="overflow-hidden">
                                                                    <div className="text-xs font-bold text-slate-800 truncate">
                                                                        {doc.fullName}
                                                                    </div>
                                                                    <div className="text-[11px] text-blue-600 font-medium truncate">
                                                                        {doc.specialtyName} • {doc.experienceYears || 5} năm KN
                                                                    </div>
                                                                    <div className="text-[11px] text-slate-500">
                                                                        {(doc.pricePerAppointment || 200000).toLocaleString('vi-VN')} đ/lượt
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={() => handleBookDoctor(doc)}
                                                                className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex-shrink-0 transition cursor-pointer shadow-xs"
                                                            >
                                                                Đặt lịch
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

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-start animate-fadeIn">
                            <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs md:text-sm text-slate-600">
                                    AI đang đối chiếu CRM từ khóa bệnh lý & phân tích triệu chứng y khoa...
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Thanh nhập tin nhắn */}
                <div className="p-3 md:p-4 bg-white border-t border-slate-200 flex-none space-y-2">
                    {/* Thanh chip từ khóa gợi ý nhanh */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs text-slate-600">
                        <span className="text-[11px] text-slate-400 font-semibold uppercase flex-shrink-0">
                            Gợi ý nhanh:
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
                            placeholder="Mô tả triệu chứng của bạn (ví dụ: mất ngủ, đau đầu, đau tức ngực...)"
                            rows={2}
                            className="flex-1 p-3 text-xs md:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 resize-none transition"
                        />

                        <button
                            onClick={() => handleSendMessage()}
                            disabled={loading || input.trim() === ""}
                            className={`px-5 md:px-7 rounded-xl text-white font-medium text-xs md:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer ${loading || input.trim() === ""
                                    ? 'bg-slate-300 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20'
                                }`}
                        >
                            <span>Gửi</span>
                            <span className="text-sm">↗</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Tra cứu Từ Điển Tri Thức CRM Độc Lập */}
            {showCrmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
                        {/* Header Modal */}
                        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl">📖</span>
                                <div>
                                    <h3 className="font-bold text-base md:text-lg">
                                        Từ Điển CRM Tri Thức Y Khoa & Phân Luồng Chuyên Khoa
                                    </h3>
                                    <p className="text-xs text-slate-400">
                                        Tệp cấu hình JSON độc lập: <code className="text-blue-300">medical_specialty_crm_rules.json</code>
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
                                    placeholder="Tìm từ khóa triệu chứng, bệnh lý..."
                                    className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                />
                                <span className="absolute left-3 top-2.5 text-slate-400 text-xs">🔍</span>
                            </div>

                            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
                                <button
                                    onClick={() => setSelectedSpecialtyTab(null)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${selectedSpecialtyTab === null ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                        }`}
                                >
                                    Tất cả ({filteredCrmSpecialties.length})
                                </button>
                                {filteredCrmSpecialties.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedSpecialtyTab(s.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex-shrink-0 ${selectedSpecialtyTab === s.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {s.specialtyName}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Nội dung danh sách chuyên khoa */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {filteredCrmSpecialties
                                .filter((s) => selectedSpecialtyTab === null || s.id === selectedSpecialtyTab)
                                .map((s) => (
                                    <div
                                        key={s.id}
                                        className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-extrabold text-lg text-slate-800">
                                                        {s.specialtyName}
                                                    </span>
                                                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 font-bold uppercase">
                                                        {s.departmentCode}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        ID: #{s.id}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {s.description}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    setShowCrmModal(false);
                                                    handleSendMessage(`Tôi muốn tư vấn về các bệnh lý thuộc chuyên khoa ${s.specialtyName}`);
                                                }}
                                                className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition self-start sm:self-auto cursor-pointer"
                                            >
                                                Tư vấn chuyên khoa này 💬
                                            </button>
                                        </div>

                                        {/* Keywords Tags */}
                                        <div className="space-y-1.5">
                                            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                🏷️ Từ khóa nhận diện triệu chứng (Keywords - {s.keywords.length})
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {s.keywords.map((kw, kwIdx) => (
                                                    <span
                                                        key={kwIdx}
                                                        className="text-[11px] px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 rounded-md border border-slate-200 transition"
                                                    >
                                                        {kw}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Common Conditions */}
                                        <div className="space-y-1.5">
                                            <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                                🩺 Bệnh lý liên quan thường gặp
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                                                {s.commonConditions.map((cond, cIdx) => (
                                                    <div key={cIdx} className="flex items-center gap-1.5">
                                                        <span className="text-blue-500">•</span>
                                                        <span>{cond}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Standard Directions */}
                                        <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                                                💡 3 Hướng xử lý chuẩn hóa
                                            </div>
                                            <div className="space-y-1 text-xs text-slate-600">
                                                {s.standardHandlingDirections.map((dir, dIdx) => (
                                                    <div key={dIdx} className="flex items-start gap-1.5">
                                                        <span className="font-bold text-emerald-600">{dIdx + 1}.</span>
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
                                Định dạng JSON độc lập cho phép cập nhật từ khóa & luật sàng lọc mà không cần biên dịch lại mã nguồn hệ thống.
                            </span>
                            <button
                                onClick={() => setShowCrmModal(false)}
                                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 transition cursor-pointer"
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