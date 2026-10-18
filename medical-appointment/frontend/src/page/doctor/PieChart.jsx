import React, { useState, useEffect, useCallback, useMemo } from 'react'; // THÊM useMemo
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { statisticService } from '../../service/statisticService';

ChartJS.register(ArcElement, Tooltip, Legend);


//Hằng số và components tĩnh
const STATUS_COLORS = {
    completed: '#10B981',
    confirmed: '#4F46E5',
    cancelled: '#F87171',
    missed: '#F59E0B',
};

const AVAILABLE_MONTHS = [
    { value: 1, name: 'Tháng 1' }, { value: 2, name: 'Tháng 2' }, { value: 3, name: 'Tháng 3' },
    { value: 4, name: 'Tháng 4' }, { value: 5, name: 'Tháng 5' }, { value: 6, name: 'Tháng 6' },
    { value: 7, name: 'Tháng 7' }, { value: 8, name: 'Tháng 8' }, { value: 9, name: 'Tháng 9' },
    { value: 10, name: 'Tháng 10' }, { value: 11, name: 'Tháng 11' }, { value: 12, name: 'Tháng 12' },
];

const STATUS_MAP = {
    'completed': { label: 'Đã Khám', color: STATUS_COLORS.completed },
    'confirmed': { label: 'Đã Xác Nhận', color: STATUS_COLORS.confirmed },
    'cancelled': { label: 'Đã Hủy', color: STATUS_COLORS.cancelled },
    'missed': { label: 'Vắng Mặt', color: STATUS_COLORS.missed },
};

// Component lọc tháng 
const MonthFilter = React.memo(({ selectedMonth, onMonthChange, primaryColor }) => {
    return (
        <div className="flex items-center space-x-2">
            <span className="text-base font-semibold text-gray-700">Tháng:</span>
            <select
                value={selectedMonth}
                onChange={onMonthChange}
                className={`p-2 border border-gray-300 rounded-lg text-base font-semibold focus:ring-${primaryColor}-500 focus:border-${primaryColor}-500 transition duration-150 shadow-sm appearance-none cursor-pointer`}
            >
                {AVAILABLE_MONTHS.map(month => (
                    <option key={month.value} value={month.value}>{month.name}</option>
                ))}
            </select>
        </div>
    );
});

// Component lọc năm 
const YearFilter = React.memo(({ selectedYear, onYearChange, primaryColor }) => {
    const availableYears = Array.from({ length: 5 }, (v, i) => new Date().getFullYear() - i);

    return (
        <div className="flex items-center space-x-2">
            <span className="text-base font-semibold text-gray-700">Năm:</span>
            <select
                value={selectedYear}
                onChange={onYearChange}
                className={`p-2 border border-gray-300 rounded-lg text-base font-semibold focus:ring-${primaryColor}-500 focus:border-${primaryColor}-500 transition duration-150 shadow-sm appearance-none cursor-pointer`}
            >
                {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                ))}
            </select>
        </div>
    );
});


// Component phụ trợ nhỏ (StatRow) 
const StatRow = ({ label, value, colorHex, percentage }) => (
    <div className="flex items-center py-2 text-xl justify-between">
        <span className="text-gray-700 flex items-center font-semibold flex-shrink-0 min-w-[140px]" style={{ fontSize: '1.15rem' }}>
            <span className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: colorHex }}></span>
            {label}
        </span>
        <div className="flex-grow mx-2 border-b border-dashed border-gray-300"></div>
        <span className="font-extrabold text-xl flex-shrink-0" style={{ color: colorHex }}>
            {value} <span className="text-gray-500 font-medium text-sm ml-0.5">({percentage}%)</span>
        </span>
    </div>
);



//Component header (Tách ra để tối ưu hóa)
const PieChartHeader = React.memo(({
    selectedMonth, selectedYear, onMonthChange, onYearChange, primaryColor, monthName
}) => {
    return (
        <div className="flex flex-col"> {/* Dùng flex-col để chứa tiêu đề và bộ lọc */}
            <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex-shrink-0">
                    📊 Thống Kê Tình Trạng Lịch Hẹn ({monthName} / {selectedYear})
                </h2>
            </div>
            {/* Bộ lọc*/}
            <div className="flex space-x-3 mb-6">
                <MonthFilter
                    selectedMonth={selectedMonth}
                    onMonthChange={onMonthChange}
                    primaryColor={primaryColor}
                />
                <YearFilter
                    selectedYear={selectedYear}
                    onYearChange={onYearChange}
                    primaryColor={primaryColor}
                />
            </div>
        </div>
    );
});

//Component chính (Logic và header)
const DetailedStatistics = ({ primaryColor }) => {

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // STATE bộ lọc
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    // Giá trị khởi tạo: Lấy thông tin bác sĩ từ sessionStorage
    const [doctor] = useState(() => JSON.parse(sessionStorage.getItem("doctor")) || {});

    // Lấy ID từ đối tượng doctor
    const doctorId = doctor.id ? parseInt(doctor.id) : null;

    // STATE dữ liệu và tình trạng
    const [apiData, setApiData] = useState({ totalAppointments: 0, statistics: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    //Hàm xử lý sự kiện(Dùng useCallback để ổn định props cho PieChartHeader)
    const handleMonthChange = useCallback((event) => {
        setSelectedMonth(parseInt(event.target.value));
    }, []);

    const handleYearChange = useCallback((event) => {
        setSelectedYear(parseInt(event.target.value));
    }, []);

    //Hàm gọi API
    const fetchStatistic = useCallback(async (month, year) => {
        if (!doctorId) {
            setError("Không thể tìm thấy ID bác sĩ.");
            setLoading(false);
            return; 
        }
        setLoading(true);
        setError(null);
        try {
            const data = await statisticService.getAppointmentStatistics(month, year, doctorId);
            setApiData(data);
        } catch (err) {
            console.error("Lỗi khi tải thống kê:", err);
            setError("Không thể tải dữ liệu thống kê.");
            setApiData({ totalAppointments: 0, statistics: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStatistic(selectedMonth, selectedYear);
    }, [selectedMonth, selectedYear, fetchStatistic]);

    //Chuẩn bị dữ liệu
    const monthName = AVAILABLE_MONTHS.find(m => m.value === selectedMonth)?.name || `Tháng ${selectedMonth}`;
    const total = apiData.totalAppointments;

    const chartData = useMemo(() => {
        const chartLabels = apiData.statistics.map(item => item.statusName);
        const chartCounts = apiData.statistics.map(item => item.count);
        const chartColors = apiData.statistics.map(item => {
            const key = Object.keys(STATUS_MAP).find(k => STATUS_MAP[k].label.toLowerCase() === item.statusName.toLowerCase());
            return key ? STATUS_COLORS[key] : '#A0AEC0';
        });

        return {
            labels: chartLabels,
            datasets: [{
                data: chartCounts,
                backgroundColor: chartColors,
                hoverBackgroundColor: chartColors.map(c => c + 'AA'),
                borderWidth: 1,
            }],
        };
    }, [apiData]);

    const options = useMemo(() => ({
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw;
                        const itemStat = apiData.statistics.find(s => s.statusName === label);
                        const percentage = itemStat ? itemStat.percentage.toFixed(1) : 0;
                        return `${label}: ${value} (${percentage}%)`;
                    }
                }
            }
        },
    }), [apiData]);

    //Rebder phần nội dung chính (loading/error)
    const renderContent = () => {
        if (loading) {
            return <div className="text-xl text-gray-600">Đang tải dữ liệu thống kê...</div>;
        }

        if (error) {
            return <div className="text-xl text-red-600">{error}</div>;
        }

        if (total === 0) {
            return (
                <p className="text-2xl text-gray-500">
                    Không có lịch hẹn trong {monthName} / {selectedYear}.
                </p>
            );
        }

        return (
            /*Bố cục chính: 2 cột */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center h-full">

                {/* Cột 1: Biểu đồ Tròn */}
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-full h-[90%] max-w-[280px] md:max-w-none">
                        <Pie data={chartData} options={options} />
                    </div>
                </div>

                {/* Cột 2: Bảng tóm tắt số liệu */}
                <div className="space-y-1 text-base h-full flex flex-col justify-center">
                    <p className="font-bold text-xl text-gray-900 border-b pb-1 mb-4">Tổng số lịch hẹn: {total}</p>

                    {apiData.statistics.map(item => {
                        const key = Object.keys(STATUS_MAP).find(k => STATUS_MAP[k].label.toLowerCase() === item.statusName.toLowerCase());
                        return (
                            <StatRow
                                key={item.statusName}
                                label={item.statusName}
                                value={item.count}
                                colorHex={key ? STATUS_COLORS[key] : '#A0AEC0'}
                                percentage={item.percentage}
                            />
                        );
                    })}
                    <div className="flex-1"></div>
                </div>
            </div>
        );
    };

    //Render chính (Kết hợp header tĩnh và nội dung động)
    return (
        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-[550px]">

            {/*Header*/}
            <PieChartHeader
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={handleMonthChange}
                onYearChange={handleYearChange}
                primaryColor={primaryColor}
                monthName={monthName}
            />

            {/*Nội dung */}
            <div className="h-[calc(100%-140px)] flex items-center justify-center">
                {renderContent()}
            </div>
        </div>
    );
};

export default DetailedStatistics;