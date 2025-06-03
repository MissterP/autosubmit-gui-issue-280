import { useMemo } from "react";
import { formatNumberMoney } from "../../../components/context/utils";

// Compact version of the most common equivalencies
const COMPACT_EQUIVALENTS = [
    {
        id: "gasoline_car",
        name: "Driving a gasoline car",
        unit: "km",
        gCO2_per_unit: 251,
        icon: "fa-solid fa-car",
        color: "#ef4444"
    },
    {
        id: "electric_car", 
        name: "Driving an electric car",
        unit: "km",
        gCO2_per_unit: 100,
        icon: "fa-solid fa-car-battery",
        color: "#10b981"
    },
    {
        id: "train_travel",
        name: "Train travel",
        unit: "km",
        gCO2_per_unit: 41,
        icon: "fa-solid fa-train",
        color: "#8b5cf6"
    },
    {
        id: "trees_year",
        name: "CO₂ absorbed by trees",
        unit: "tree-years",
        gCO2_per_unit: 21000,
        icon: "fa-solid fa-tree",
        color: "#22c55e"
    },
    {
        id: "smartphone_charge",
        name: "Smartphone charges",
        unit: "charges",
        gCO2_per_unit: 8,
        icon: "fa-solid fa-mobile-phone",
        color: "#64748b"
    },
    {
        id: "household_electricity",
        name: "Household electricity",
        unit: "days",
        gCO2_per_unit: 6500,
        icon: "fa-solid fa-house",
        color: "#f59e0b"
    }
];

const CompactEquivalentItem = ({ equivalent, footprintGrams }) => {
    const equivalentAmount = footprintGrams / equivalent.gCO2_per_unit;
    
    const formatAmount = (amount) => {
        if (amount < 0.01) return amount.toExponential(2);
        if (amount < 1) return amount.toFixed(3);
        if (amount < 100) return formatNumberMoney(amount, false, 2);
        if (amount < 1000) return formatNumberMoney(amount, false, 1);
        return formatNumberMoney(Math.round(amount), true);
    };

    const getEquivalentText = () => {
        if (equivalent.id === "trees_year") {
            return `${formatAmount(equivalentAmount)} ${equivalent.unit} to absorb this CO₂`;
        }
        return `${formatAmount(equivalentAmount)} ${equivalent.unit}`;
    };

    return (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg">
            <div 
                className="p-2 rounded-full text-white flex-shrink-0"
                style={{ backgroundColor: equivalent.color }}
            >
                <i className={`${equivalent.icon} text-sm`}></i>
            </div>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-dark dark:text-light">
                    {equivalent.name}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 font-semibold">
                    {getEquivalentText()}
                </div>
            </div>
        </div>
    );
};

const CompactCarbonFootprintComparison = ({ 
    footprintGrams, 
    title = "Carbon Footprint Equivalencies",
    showTitle = true,
    maxItems = 6
}) => {
    const validFootprint = useMemo(() => {
        const numValue = Number(footprintGrams);
        return isNaN(numValue) || numValue <= 0 ? 0 : numValue;
    }, [footprintGrams]);

    if (validFootprint === 0) {
        return (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                    <i className="fa-solid fa-info-circle"></i>
                    <span className="text-sm">No carbon footprint data available</span>
                </div>
            </div>
        );
    }

    const displayEquivalents = COMPACT_EQUIVALENTS.slice(0, maxItems);

    return (
        <div className="space-y-4">
            {showTitle && (
                <div className="flex items-center gap-2">
                    <i className="fa-solid fa-scale-balanced text-green-500"></i>
                    <h4 className="font-semibold text-dark dark:text-light">{title}</h4>
                </div>
            )}

            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-center">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatNumberMoney(validFootprint, true)} gCO₂
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">
                        Total Carbon Footprint
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    This is equivalent to:
                </div>
                {displayEquivalents.map((equivalent) => (
                    <CompactEquivalentItem
                        key={equivalent.id}
                        equivalent={equivalent}
                        footprintGrams={validFootprint}
                    />
                ))}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">
                <i className="fa-solid fa-info-circle mr-1"></i>
                Equivalencies based on EPA/DEFRA standard factors
            </div>
        </div>
    );
};

export default CompactCarbonFootprintComparison;
