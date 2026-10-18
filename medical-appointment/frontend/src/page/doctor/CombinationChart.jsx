import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { statisticService } from '../../service/statisticService';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    PointElement,
    LineElement
} from 'chart.js';

// Đăng ký tất cả các thành phần cần thiết
ChartJS.register(
    CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend
);

//CẤU HÌNH & COMPONENTS TĨNH (SỬ DỤNG MEMO)
const CHART_CONFIG = {
    comboRevenuePatient: {
        title: '📊 Doanh Thu & Số Lượt Khám',
        datasets: [
            { label: 'Doanh Thu', color: '#FFA500', key: 'revenue', yAxisID: 'revenueY', type: 'line', order: 0 },
            { label: 'Lượt Khám', color: '#059669', key: 'totalAppointments', yAxisID: 'patientY', type: 'bar', order: 1 }
        ],
        scaleLabelRevenue: (value) => value.toFixed(1) + ' Tr',
        scaleLabelPatient: (value) => value % 1 === 0 ? value : null,
        tooltipLabelRevenue: (valueInMillions) => {
            const valueInVND = valueInMillions * 1000000;
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(valueInVND);
        },
        tooltipLabelPatient: (value) => value + ' lượt khám',
        dualAxis: true
    }
};

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

// Component Header 
const BarChartHeader = React.memo(({
    selectedYear,
    onYearChange,
    primaryColor,
    title
}) => {
    return (
        <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex-shrink-0">
                {title}
            </h2>
            <YearFilter
                selectedYear={selectedYear}
                onYearChange={onYearChange}
                primaryColor={primaryColor}
            />
        </div>
    );
});



//Component chính (logic và render)
const CombinationChart = ({ primaryColor }) => {
    const config = CHART_CONFIG.comboRevenuePatient;
    const currentYear = new Date().getFullYear();

    // State cho bộ lọc và dữ liệu
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [apiData, setApiData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [doctor] = useState(() => JSON.parse(sessionStorage.getItem("doctor")) || {});

    // Lấy ID từ đối tượng doctor
    const doctorId = doctor.id ? parseInt(doctor.id) : null;

    //Hàm xử lý sự kiện năm (dùng useCallback) 
    const handleYearChange = useCallback((event) => {
        setSelectedYear(parseInt(event.target.value));
    }, []); 

    //Logic gọi API (useCallback)
    const fetchStatistics = useCallback(async (year) => {
        if (!doctorId) {
            setError("Không thể tìm thấy ID bác sĩ.");
            setLoading(false);
            return; 
        }
        setLoading(true); setError(null);
        try {
            const data = await statisticService.getYearlyRevenuePatientStatistics(year,doctorId);
            setApiData(data);
        } catch (err) {
            console.error("Lỗi khi tải thống kê doanh thu/lượt khám:", err);
            setError("Không thể tải dữ liệu báo cáo hàng tháng.");
            setApiData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    //useEffect: Chạy khi năm thay đổi
    useEffect(() => {
        fetchStatistics(selectedYear);
    }, [selectedYear, fetchStatistics]);

    // Logic kiểm tra dữ liệu rỗng
    const totalRevenue = apiData.reduce((sum, item) => sum + item.revenue, 0);
    const totalAppointments = apiData.reduce((sum, item) => sum + item.totalAppointments, 0);
    const hasData = totalRevenue > 0 || totalAppointments > 0;

    // Chart Data (dùng useMemo)
    const chartData = useMemo(() => {
        const labels = apiData.map(item => item.monthName);
        const datasets = config.datasets.map(dConfig => ({
            type: dConfig.type,
            label: dConfig.label,
            data: apiData.map(item => item[dConfig.key] / (dConfig.key === 'revenue' ? 1000000 : 1)),
            //Cấu hình style
            backgroundColor: (dConfig.type === 'bar' ? dConfig.color : 'transparent'),
            borderColor: dConfig.color,
            pointBackgroundColor: (dConfig.type === 'line' ? 'white' : undefined),
            yAxisID: dConfig.yAxisID,
            order: dConfig.order
        }));
        return { labels, datasets };
    }, [apiData, config]);

    // Cấu hình options (dùng useMemo)
    const options = useMemo(() => ({
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top', display: true, align: 'center',
                labels: {
                    padding: 20, sort: (a, b) => {
                        if (a.text === 'Lượt Khám') return -1;
                        if (b.text === 'Lượt Khám') return 1;
                        return 0;
                    }
                }
            },
            title: { display: false },
            tooltip: {
                callbacks: { 
                    title: function (context) {
                        return [context[0].label];
                    },
                    label: function (context) {
                        const value = context.parsed.y;
                        const label = context.dataset.label;
                        const config = CHART_CONFIG.comboRevenuePatient; 
                        
                        if (context.dataset.yAxisID === 'revenueY') {
                            return `${label}: ${config.tooltipLabelRevenue(value)}`;
                        } else {
                            return `${label}: ${config.tooltipLabelPatient(value)}`;
                        }
                    }
                }
            },
        },
        scales: {
            revenueY: { type: 'linear', position: 'right', title: { display: true, text: 'Doanh Thu' }, beginAtZero: true, suggestedMax: 5, ticks: { callback: config.scaleLabelRevenue } },
            patientY: { type: 'linear', position: 'left', title: { display: true, text: 'Lượt Khám' }, beginAtZero: true, suggestedMax: 5, grid: { drawOnChartArea: false }, ticks: { callback: config.scaleLabelPatient } },
            x: { stacked: false, grid: { display: false }, ticks: { maxRotation: 30, minRotation: 30, autoSkip: false, padding: 10 } }
        }
    }), [config]);

    //Render Loading/Error Block 
    if (loading || error) {
        const ErrorHeader = (
            <BarChartHeader
                title={config.title}
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
                primaryColor={primaryColor}
            />
        );

        if (loading) {
            return (
                <div className="bg-white p-6 rounded-xl shadow-xl h-[550px]">
                    {ErrorHeader}
                    <div className="flex items-center justify-center h-[430px]">
                        <p className="text-xl text-gray-600">Đang tải dữ liệu báo cáo...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="bg-white p-6 rounded-xl shadow-xl h-[550px]">
                    {ErrorHeader}
                    <div className="bg-red-50 p-6 rounded-xl h-[430px] flex items-center justify-center mt-4">
                        <p className="text-xl text-red-600">{error}</p>
                    </div>
                </div>
            );
        }
    }


    //render chính
    return (
        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 h-[550px] relative">
            {/*chứa title và lọc năm*/}
            <BarChartHeader
                title={config.title}
                selectedYear={selectedYear}
                onYearChange={handleYearChange}
                primaryColor={primaryColor}
            />

            {/*chứa dữ liệu*/}
            <div className="h-[430px] relative">
                <Bar
                    data={chartData}
                    options={options}
                />
                {!hasData && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
                        <p className="text-2xl text-gray-500 text-center">
                            Không có dữ liệu trong năm {selectedYear}. <br /> Vui lòng chọn năm khác.
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
};

export default CombinationChart;