import { useState } from "react";
import { cn } from "../../../services/utils";

const HistoricalDataSection = ({
    // Data and state
    historicalData,
    view,
    selectedDate,
    setSelectedDate,
    selectedItems,
    setSelectedItems,
    showItems,
    setShowItems,
    
    // Search functionality
    dateSearchQuery,
    setDateSearchQuery,
    itemSearchQuery,
    setItemSearchQuery,
    
    // Item handling functions
    getItemsForDate,
    handleItemClick,
    
    // Configuration
    itemDisplayConfig,
    
    // Optional pagination override
    itemsPerPage = 9
}) => {
    const [currentPage, setCurrentPage] = useState(1);

    const handleDateChange = (date) => {
        const items = getItemsForDate(date);
        setSelectedItems(items);
        setSelectedDate(date);
        setShowItems(items.length > 0);
        setCurrentPage(1); // Reset pagination when changing date
    };

    if (view !== "historical" || !historicalData?.models) {
        return null;
    }

    return (
        <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-dark dark:text-light">
                    View {itemDisplayConfig.gridTitle} by Date
                </h3>
            </div>
            
            {/* Search Controls */}
            <div className="mb-4 space-y-3">
                <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-64">
                        <label className="block text-sm font-medium text-dark dark:text-light mb-1">
                            Search Dates
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search dates (e.g., 15-01-2025, etc.)"
                                value={dateSearchQuery}
                                onChange={(e) => setDateSearchQuery(e.target.value)}
                                className="form-input w-full pl-10"
                            />
                            <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-64">
                        <label className="block text-sm font-medium text-dark dark:text-light mb-1">
                            {itemDisplayConfig.searchLabel}
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={itemDisplayConfig.searchPlaceholder}
                                value={itemSearchQuery}
                                onChange={(e) => setItemSearchQuery(e.target.value)}
                                className="form-input w-full pl-10"
                            />
                            <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        </div>
                    </div>
                </div>
                
                {(dateSearchQuery || itemSearchQuery) && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => {
                                setDateSearchQuery("");
                                setItemSearchQuery("");
                            }}
                            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <i className="fa-solid fa-times mr-1"></i>
                            Clear filters
                        </button>
                    </div>
                )}
            </div>
            
            {/* Filtered Date Buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(historicalData.models)
                    .sort()
                    .filter(date => {
                        if (!dateSearchQuery) return true;
                        const searchLower = dateSearchQuery.toLowerCase();
                        const dateStr = date.toLowerCase();
                        const formattedDate = new Date(date).toLocaleDateString().toLowerCase();
                        const monthName = new Date(date).toLocaleDateString('es-ES', { month: 'long' }).toLowerCase();
                        const shortMonth = new Date(date).toLocaleDateString('es-ES', { month: 'short' }).toLowerCase();
                        
                        return dateStr.includes(searchLower) || 
                               formattedDate.includes(searchLower) ||
                               monthName.includes(searchLower) ||
                               shortMonth.includes(searchLower);
                    })
                    .map(date => (
                        <button
                            key={date}
                            onClick={() => handleDateChange(date)}
                            className={cn(
                                "px-3 py-1 text-sm rounded transition-colors",
                                selectedDate === date
                                    ? "bg-orange-500 text-white"
                                    : "bg-primary text-white hover:bg-secondary"
                            )}
                        >
                            {new Date(date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit'
                            })}
                        </button>
                    ))}
            </div>

            {/* Items Display */}
            {showItems && selectedItems.length > 0 && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                            {(() => {
                                const filteredItems = selectedItems.filter(item => {
                                    if (!itemSearchQuery) return true;
                                    const searchLower = itemSearchQuery.toLowerCase();
                                    return item[itemDisplayConfig.itemIdKey].toLowerCase().includes(searchLower) ||
                                           item[itemDisplayConfig.itemNameKey].toLowerCase().includes(searchLower);
                                });
                                const filteredTotalPages = Math.ceil(filteredItems.length / itemsPerPage);
                                
                                return filteredTotalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="px-2 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <i className="fa-solid fa-chevron-left"></i>
                                        </button>
                                        <span className="text-sm text-gray-600 dark:text-gray-300">
                                            {currentPage} / {filteredTotalPages}
                                        </span>
                                        <button
                                            onClick={() => setCurrentPage(Math.min(filteredTotalPages, currentPage + 1))}
                                            disabled={currentPage === filteredTotalPages}
                                            className="px-2 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <i className="fa-solid fa-chevron-right"></i>
                                        </button>
                                    </div>
                                );
                            })()}
                            
                            <h4 className="font-medium text-dark dark:text-light">
                                {itemDisplayConfig.gridTitle} {new Date(selectedDate).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: '2-digit',
                                    day: '2-digit'
                                })}
                                {itemSearchQuery && ` (filtered)`} ({(() => {
                                    const filteredItems = selectedItems.filter(item => {
                                        if (!itemSearchQuery) return true;
                                        const searchLower = itemSearchQuery.toLowerCase();
                                        return item[itemDisplayConfig.itemIdKey].toLowerCase().includes(searchLower) ||
                                               item[itemDisplayConfig.itemNameKey].toLowerCase().includes(searchLower);
                                    });
                                    return filteredItems.length;
                                })()} total)
                            </h4>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                        {(() => {
                            const filteredItems = selectedItems.filter(item => {
                                if (!itemSearchQuery) return true;
                                const searchLower = itemSearchQuery.toLowerCase();
                                return item[itemDisplayConfig.itemIdKey].toLowerCase().includes(searchLower) ||
                                       item[itemDisplayConfig.itemNameKey].toLowerCase().includes(searchLower);
                            });
                            
                            const startIndex = (currentPage - 1) * itemsPerPage;
                            const endIndex = startIndex + itemsPerPage;
                            return filteredItems.slice(startIndex, endIndex);
                        })().map((item, index) => (
                            <div
                                key={index}
                                onClick={() => handleItemClick(item[itemDisplayConfig.itemIdKey])}
                                className="p-3 bg-gray-50 dark:bg-neutral-600 rounded border cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-500 transition-colors"
                            >
                                <div className="font-mono text-sm text-primary font-medium truncate mb-2" title={item[itemDisplayConfig.itemIdKey]}>
                                    {item[itemDisplayConfig.itemIdKey]}
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.modelColor && (
                                        <div 
                                            className="w-3 h-3 rounded-full border border-gray-300" 
                                            style={{ backgroundColor: item.modelColor }}
                                        ></div>
                                    )}
                                    <div className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                        {item[itemDisplayConfig.itemNameKey]}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {(() => {
                        const filteredItems = selectedItems.filter(item => {
                            if (!itemSearchQuery) return true;
                            const searchLower = itemSearchQuery.toLowerCase();
                            return item[itemDisplayConfig.itemIdKey].toLowerCase().includes(searchLower) ||
                                   item[itemDisplayConfig.itemNameKey].toLowerCase().includes(searchLower);
                        });
                        
                        if (filteredItems.length === 0 && itemSearchQuery) {
                            return (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {itemDisplayConfig.noItemsMessage} "{itemSearchQuery}"
                                    </p>
                                </div>
                            );
                        }
                        return null;
                    })()}
                </div>
            )}
        </div>
    );
};

export default HistoricalDataSection;