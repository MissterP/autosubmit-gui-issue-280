import { useMemo } from "react";

// Equivalencies based on Uber's methodology and standard conversion factors
const CARBON_EQUIVALENTS = [
    {
        id: "gasoline_car",
        name: "Driving a gasoline car",
        unit: "km",
        gCO2_per_unit: 251, // g CO2 per km (EPA 2023)
        icon: "fa-solid fa-car",
        color: "#ef4444"
    },
    {
        id: "electric_car",
        name: "Driving an electric car",
        unit: "km", 
        gCO2_per_unit: 100, // g CO2 per km (average grid mix)
        icon: "fa-solid fa-car-battery",
        color: "#10b981"
    },
    {
        id: "international_flight",
        name: "International flight",
        unit: "km",
        gCO2_per_unit: 246, // g CO2 per passenger-km (DEFRA 2023)
        icon: "fa-solid fa-plane",
        color: "#06b6d4"
    },
    {
        id: "train_travel",
        name: "Train travel",
        unit: "km",
        gCO2_per_unit: 41, // g CO2 per passenger-km
        icon: "fa-solid fa-train",
        color: "#8b5cf6"
    },
    {
        id: "household_electricity",
        name: "Average household electricity consumption",
        unit: "days",
        gCO2_per_unit: 6500, // g CO2 per day (based on 30 kWh/day at global avg)
        icon: "fa-solid fa-house",
        color: "#f59e0b"
    },
    {
        id: "trees_year",
        name: "CO₂ absorbed by trees",
        unit: "tree-years",
        gCO2_per_unit: 21000, // g CO2 per tree per year (EPA estimate)
        icon: "fa-solid fa-tree",
        color: "#22c55e"
    },
    {
        id: "smartphone_charge",
        name: "Smartphone charges",
        unit: "charges",
        gCO2_per_unit: 8, // g CO2 per charge (11.5 Wh battery, global grid avg)
        icon: "fa-solid fa-mobile-phone",
        color: "#64748b"
    },
    {
        id: "laptop_hour",
        name: "Laptop usage",
        unit: "hours",
        gCO2_per_unit: 40, // g CO2 per hour (65W laptop, global grid avg)
        icon: "fa-solid fa-laptop",
        color: "#84cc16"
    },
    {
        id: "coal_burned",
        name: "Coal burned",
        unit: "kg",
        gCO2_per_unit: 2460000, // g CO2 per kg coal (EPA)
        icon: "fa-solid fa-fire",
        color: "#525252"
    },
    {
        id: "waste_recycled",
        name: "Waste recycled instead of landfilled",
        unit: "kg",
        gCO2_per_unit: 690, // g CO2 saved per kg (EPA)
        icon: "fa-solid fa-recycle",
        color: "#059669"
    }
];

const CarbonEquivalentCard = ({ equivalent, footprintGrams }) => {
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
            return `${formatAmount(equivalentAmount)} ${equivalent.unit} to absorb this CO₂`;
        }
        return `${formatAmount(equivalentAmount)} ${equivalent.unit}`;
    };

    return (
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-gray-200 dark:border-neutral-600 hover:shadow-md transition-all duration-200">
            <div className="flex items-center gap-3 mb-3">
                <div 
                    className="p-2 rounded-full text-white text-sm"
                    style={{ backgroundColor: equivalent.color }}
                >
                    <i className={equivalent.icon}></i>
                </div>
                <div className="flex-1">
                    <h4 className="font-medium text-dark dark:text-light text-sm">
                        {equivalent.name}
                    </h4>
                </div>
            </div>
            
            <div className="text-center">
                <div className="text-lg font-bold text-dark dark:text-light">
                    {getEquivalentText()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {equivalent.gCO2_per_unit.toLocaleString()} gCO₂ per {equivalent.unit}
                </div>
            </div>
        </div>
    );
};

const CarbonFootprintComparison = ({ footprintGrams, title = "Carbon Footprint Equivalencies" }) => {
    const validFootprint = useMemo(() => {
        const numValue = Number(footprintGrams);
        return isNaN(numValue) || numValue <= 0 ? 0 : numValue;
    }, [footprintGrams]);

    if (validFootprint === 0) {
        return (
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <div className="flex items-center gap-3 mb-4">
                    <i className="fa-solid fa-scale-balanced text-green-500 text-xl"></i>
                    <h3 className="text-lg font-semibold text-dark dark:text-light">
                        {title}
                    </h3>
                </div>
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i className="fa-solid fa-info-circle text-4xl mb-3"></i>
                    <p>No carbon footprint data available to show equivalencies.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
            <div className="flex items-center gap-3 mb-6">
                <i className="fa-solid fa-scale-balanced text-orange-500 text-xl"></i>
                <h3 className="text-lg font-semibold text-dark dark:text-light">
                    {title}
                </h3>
            </div>

            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {validFootprint.toLocaleString()} gCO₂
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                        Total Carbon Footprint Generated
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <h4 className="text-md font-medium text-dark dark:text-light mb-3">
                    This is equivalent to:
                </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                {CARBON_EQUIVALENTS.map((equivalent) => (
                    <CarbonEquivalentCard 
                        key={equivalent.id}
                        equivalent={equivalent}
                        footprintGrams={validFootprint}
                    />
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-neutral-600">
                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>
                        <i className="fa-solid fa-info-circle mr-2"></i>
                        Equivalencies are based on standard conversion factors from EPA, DEFRA and other recognized sources.
                    </p>
                    <p>
                        <i className="fa-solid fa-leaf mr-2"></i>
                        Values may vary based on specific conditions, fuel type, vehicle efficiency, and regional energy mix.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CarbonFootprintComparison;
