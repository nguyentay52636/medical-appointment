import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import useFetch from "../hook/useFetch";
import { specialtyService } from "../service/specialtyService";

export default function NavBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchStatus, setSearchStatus] = useState('');
    const [showAuthModal, setShowAuthModal] = useState(false);

    const navigate = useNavigate();

    // load specialties for suggestion
    const { data: specialties = [], loading: specialtiesLoading } = useFetch(specialtyService.getAllSpecialties);
    useEffect(() => {
        const onDocClick = (e) => {
            if (!e.target.closest || !e.target.closest('.suggestion-container')) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('click', onDocClick);
        return () => document.removeEventListener('click', onDocClick);
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const navLinkClasses = ({ isActive }) =>
        `block py-2 px-4 lg:py-5 lg:px-4 hover:text-blue-600 transition duration-150 text-base font-medium 
        ${isActive ? "font-bold text-blue-600 border-b-2 border-blue-600 lg:border-b-0" : "text-gray-700"}`;

    const navItems = [
        { to: "about", label: "Về Chúng Tôi" },
        { to: "specialty", label: "Chuyên Khoa" },
        { to: "doctor_list", label: "Đội ngũ bác sĩ" },
        { to: "contact", label: "Liên Hệ" },
        { to: "support", label: "Hỗ Trợ" },
        { to: "condition", label: "Điều Khoản" },
    ];

    const handleSearch = (e) => {
        e.preventDefault();
        closeMenu();
        const q = searchQuery.trim();
        if (!q) {
            setSearchStatus('Vui lòng nhập từ khóa tìm kiếm.');
            setTimeout(() => setSearchStatus(''), 3000);
            return;
        }

        if (suggestions.length > 0) {
            const name = suggestions[0].specialtyName || suggestions[0];
            navigate(`/patient/doctor_list?specialty=${encodeURIComponent(name)}`);
            setShowSuggestions(false);
            return;
        }

        setShowSuggestions(true);
        setSearchStatus(`Không tìm thấy kết quả cho: "${q}".`);
        setTimeout(() => setSearchStatus(''), 4000);
    };

    const updateSuggestions = (q) => {
        const v = q.trim().toLowerCase();
        if (!v) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const matches = (specialties || [])
            .filter(s => (s.specialtyName || s).toString().toLowerCase().includes(v))
            .slice(0, 8);

        setSuggestions(matches);
        setShowSuggestions(true);
    };

    const onSuggestionClick = (s) => {
        const name = s.specialtyName || s;
        navigate(`/patient/doctor_list?specialty=${encodeURIComponent(name)}`);
        setShowSuggestions(false);
        setSearchQuery(name);
    };

    const onInputChange = (value) => {
        setSearchQuery(value);
        updateSuggestions(value);
    };

    const highlightMatch = (text, q) => {
        if (!q) return text;
        const idx = text.toLowerCase().indexOf(q.toLowerCase());
        if (idx === -1) return text;
        const before = text.slice(0, idx);
        const match = text.slice(idx, idx + q.length);
        const after = text.slice(idx + q.length);
        return (
            <>
                {before}
                <span className="bg-blue-200 px-1 rounded">{match}</span>
                {after}
            </>
        );
    };

    const handleBookingClick = () => {
        closeMenu();
        const token = sessionStorage.getItem("patient");
        if (!token) {
            setShowAuthModal(true);
            return;
        }
        navigate("/patient/booking");
    };

    return (
        <>
            <nav className="bg-white sticky top-12 w-full z-40 p-0 shadow-lg border-b border-gray-100">
                <div className="mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
                    <Link to="/patient/home" className="flex items-center py-4">
                        <h1 className="m-0 text-3xl font-extrabold text-blue-600 flex items-center gap-2">
                            Klinik
                        </h1>
                    </Link>

                    <div className="hidden lg:block w-1/4">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Tìm kiếm chuyên khoa..."
                                value={searchQuery}
                                onChange={(e) => onInputChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSearch(e);
                                    }
                                }}
                                className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-12 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full text-gray-400 hover:text-blue-600 transition"
                                aria-label="Tìm kiếm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <circle cx="11" cy="11" r="8" />
                                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </button>

                            {showSuggestions && (
                                <div className="absolute left-0 right-0 mt-2 bg-white border rounded shadow suggestion-container z-50 max-h-60 overflow-auto">
                                    {suggestions.length === 0 ? (
                                        <div className="px-4 py-3 text-gray-600">
                                            Không tìm thấy kết quả cho: "<span className="font-semibold">{searchQuery}</span>".
                                            <div className="mt-2">
                                                <button
                                                    onClick={(ev) => {
                                                        ev.preventDefault();
                                                        // navigate to doctor list using raw query
                                                        navigate(`/patient/doctor_list?specialty=${encodeURIComponent(searchQuery)}`);
                                                        setShowSuggestions(false);
                                                    }}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    Tìm kiếm với từ khóa này
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        suggestions.map((s, idx) => {
                                            const name = s.specialtyName || s;
                                            return (
                                                <button key={idx} onClick={(ev) => { ev.preventDefault(); onSuggestionClick(s); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                                                    {highlightMatch(name, searchQuery)}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                        </form>
                    </div>

                    <button onClick={toggleMenu} className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {isMenuOpen ? '✖' : '☰'}
                    </button>

                    <div className={`absolute lg:static top-full left-0 w-full lg:w-auto bg-white lg:flex lg:flex-row shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-[-100%] opacity-0 lg:translate-y-0 lg:opacity-100'}`}>
                        <div className="flex flex-col lg:flex-row lg:ml-auto p-4 lg:p-0">
                            <div className="lg:hidden w-full relative mb-4">
                                <form onSubmit={handleSearch} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Tìm kiếm bác sĩ, chuyên khoa..."
                                        value={searchQuery}
                                        onChange={(e) => onInputChange(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleSearch(e);
                                            }
                                        }}
                                        className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-12 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full text-gray-400 hover:text-blue-600 transition"
                                        aria-label="Tìm kiếm"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                    </button>

                                    {showSuggestions && (
                                        <div className="absolute left-0 right-0 mt-2 bg-white border rounded shadow suggestion-container z-50 max-h-60 overflow-auto">
                                            {suggestions.length === 0 ? (
                                                <div className="px-4 py-3 text-gray-600">
                                                    Không tìm thấy kết quả cho: "<span className="font-semibold">{searchQuery}</span>".
                                                    <div className="mt-2">
                                                        <button
                                                            onClick={(ev) => {
                                                                ev.preventDefault();
                                                                navigate(`/patient/doctor_list?specialty=${encodeURIComponent(searchQuery)}`);
                                                                setShowSuggestions(false);
                                                            }}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            Tìm kiếm với từ khóa này
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                suggestions.map((s, idx) => {
                                                    const name = s.specialtyName || s;
                                                    return (
                                                        <button key={idx} onClick={(ev) => { ev.preventDefault(); onSuggestionClick(s); }} className="w-full text-left px-4 py-2 hover:bg-gray-100">
                                                            {highlightMatch(name, searchQuery)}
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    )}
                                </form>
                            </div>

                            {navItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    onClick={closeMenu}
                                    className={navLinkClasses}
                                >
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>

                        <button
                            onClick={handleBookingClick}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-xl transition duration-300 flex items-center justify-center gap-2 w-full lg:w-auto mt-2 lg:mt-0 transform hover:scale-[1.02] cursor-pointer"
                        >
                            <i className="fas fa-calendar-check text-xl"></i> ĐẶT LỊCH NGAY
                        </button>
                    </div>
                </div>
            </nav>

            {searchStatus && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 p-3 bg-blue-500 text-white rounded-lg shadow-xl transition-opacity duration-300 opacity-95 text-sm font-medium">
                    {searchStatus}
                </div>
            )}

            {showAuthModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                    <div className="relative bg-white p-6 rounded-xl w-[420px] shadow-2xl animate-fadeIn">
                        <button onClick={() => setShowAuthModal(false)} className="absolute right-0 top-0 w-8 h-8 rounded-full bg-gray-200 hover:bg-red-500 hover:text-white text-gray-600 flex items-center justify-center transition cursor-pointer">✕</button>
                        <h2 className="text-xl font-bold text-center mb-6">Bạn cần đăng nhập trước khi đặt lịch</h2>
                        <button
                            className="w-full bg-blue-600 text-white py-2 rounded-lg mb-3 cursor-pointer hover:bg-blue-700 transition"
                            onClick={() => {
                                setShowAuthModal(false); 
                                navigate("/patient/login");
                            }}
                        >
                            Đăng nhập
                        </button>

                        <button
                            className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg cursor-pointer hover:bg-gray-300 transition"
                            onClick={() => {
                                setShowAuthModal(false); 
                                navigate("/patient/register");
                            }}
                        >
                            Đăng ký
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
