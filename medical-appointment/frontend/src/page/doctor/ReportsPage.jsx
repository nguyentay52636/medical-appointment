import React, { useState } from 'react';
import CombinationChart from './CombinationChart'; 
import PieChart from './PieChart'; 
import DetailedReportTable from './DetailedReportTable'; 

const PRIMARY_COLOR = 'blue';

function ReportPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('30days'); 

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    const handleMonthChange = (e) => setSelectedMonth(parseInt(e.target.value));
    const handleYearChange = (e) => setSelectedYear(parseInt(e.target.value));

    return (
        <div className="space-y-8">
            <h1 className={`text-4xl font-extrabold text-gray-900 border-b-4 border-black-600/30 pb-3 tracking-tight`}>
                Báo Cáo & Phân Tích 
            </h1>
            
            {/* Hàng 1*/}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"> 
                
                {/*Biểu đồ tròn (DetailedStatistics)*/}
                <div className="lg:col-span-1">
                    <PieChart 
                        primaryColor={PRIMARY_COLOR} 
                    />
                </div>
                
                {/*Biểu đồ kết hợp(doanh thu & lượt khám) */}
                <div className="lg:col-span-1">
                    <CombinationChart 
                        primaryColor={PRIMARY_COLOR} 
                    />
                </div>
            </div>
            
            {/* Hàng 2: bảng chi tiết  */}
            <DetailedReportTable 
                reportData={[]} 
                selectedPeriod={selectedPeriod}
            />

        </div>
    );
}

export default ReportPage;