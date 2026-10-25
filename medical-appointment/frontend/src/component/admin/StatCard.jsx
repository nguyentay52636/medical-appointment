import React from 'react';

export default function StatCard({
    title,
    value,
    subText,
    icon,
    gradient = 'from-blue-500 to-indigo-600',
    iconBg = 'bg-blue-50 text-blue-600',
    badgeText,
    badgeColor = 'bg-blue-50 text-blue-700'
}) {
    return (
        <div className="relative overflow-hidden bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 group">
            {/* Top decorative gradient bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}></div>

            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
                    <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                    <i className={icon}></i>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{subText}</span>
                {badgeText && (
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${badgeColor}`}>
                        {badgeText}
                    </span>
                )}
            </div>
        </div>
    );
}
