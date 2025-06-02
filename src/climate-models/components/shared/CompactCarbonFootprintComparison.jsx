import { useMemo } from "react";

// Versión compacta de las equivalencias más comunes
const COMPACT_EQUIVALENTS = [
    {
        id: "gasoline_car",
        name: "Conducir un coche de gasolina",
        unit: "km",
        gCO2_per_unit: 251,
        icon: "fa-solid fa-car",
        color: "#ef4444"
    },
    {
        id: "electric_car", 
        name: "Conducir un coche eléctrico",
        unit: "km",
        gCO2_per_unit: 100,
        icon: "fa-solid fa-car-battery",
        color: "#10b981"
    },
    {
        id: "train_travel",
        name: "Viaje en tren",
        unit: "km",
        gCO2_per_unit: 41,
        icon: "fa-solid fa-train",
        color: "#8b5cf6"
    },
    {
        id: "trees_year",
        name: "CO₂ absorbido por árboles",
        unit: "árboles-año",
        gCO2_per_unit: 21000,
        icon: "fa-solid fa-tree",
        color: "#22c55e"
    },
    {
        id: "smartphone_charge",
        name: "Cargas de smartphone",
        unit: "cargas",
        gCO2_per_unit: 8,
        icon: "fa-solid fa-mobile-phone",
        color: "#64748b"
    },
    {
        id: "household_electricity",
        name: "Electricidad doméstica",
        unit: "días",
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
        if (amount < 100) return amount.toFixed(2);
        if (amount < 1000) return amount.toFixed(1);
        return Math.round(amount).toLocaleString();
    };

    const getEquivalentText = () => {
        if (equivalent.id === "trees_year") {
            return `${formatAmount(equivalentAmount)} ${equivalent.unit} para absorber este CO₂`;
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
    title = "Equivalencias de Huella de Carbono",
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
                    <span className="text-sm">No hay datos de huella de carbono disponibles</span>
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
                        {validFootprint.toLocaleString()} gCO₂
                    </div>
                    <div className="text-xs text-green-700 dark:text-green-300">
                        Huella de Carbono Total
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Esto es equivalente a:
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
                Equivalencias basadas en factores estándares EPA/DEFRA
            </div>
        </div>
    );
};

export default CompactCarbonFootprintComparison;
