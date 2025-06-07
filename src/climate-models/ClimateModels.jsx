import useASTitle from "../hooks/useASTitle";
import useBreadcrumb from "../hooks/useBreadcrumb";
import { useState } from "react";
import { cn } from "../services/utils";
import { Link } from "react-router-dom";

const MetricCard = ({ 
    title, 
    description, 
    icon, 
    route, 
    bgColor = "bg-white dark:bg-neutral-700" 
}) => {
    return (
        <Link
            to={route}
            className={cn(
                "block p-6 rounded-lg border transition-all duration-200 hover:shadow-lg hover:scale-105",
                "border-gray-200 dark:border-neutral-600",
                bgColor,
                "group"
            )}
        >
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary text-white group-hover:bg-secondary transition-colors">
                    <i className={cn("text-2xl", icon)}></i>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-dark dark:text-light mb-2">
                        {title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {description}
                    </p>
                </div>
                <div className="text-primary group-hover:text-secondary transition-colors">
                    <i className="fa-solid fa-arrow-right text-xl"></i>
                </div>
            </div>
        </Link>
    );
};

const ClimateModels = () => {
    useASTitle("Climate Models");
    useBreadcrumb([{ name: "Climate Models" }]);
    
    const [searchFilter, setSearchFilter] = useState("");

    const metrics = [
        {
            id: "popular-models",
            title: "Popular Models",
            description: "Analyze the most frequently used climate models in experiments. View aggregated usage statistics and historical trends to understand model popularity over time.",
            icon: "fa-solid fa-chart-line",
            route: "/climate-models/popular-models"
        },
        {
            id: "footprint-models", 
            title: "Models Carbon Footprint",
            description: "Monitor the computational footprint and resource usage of different climate models. Track energy consumption and performance metrics across simulation jobs.",
            icon: "fa-solid fa-leaf",
            route: "/climate-models/footprint-models"
        },
        {
            id: "sypd-parallelization",
            title: "SYPD vs Parallelization",
            description: "Analyze Simulated Years Per Day performance against parallelization/CPU count. Compare performance across different climate models and HPC platforms.",
            icon: "fa-solid fa-tachometer-alt",
            route: "/climate-models/sypd-parallelization"
        },
        {
            id: "chsy-parallelization",
            title: "CHSY vs Parallelization", 
            description: "Examine Core Hours per Simulated Year metrics versus parallelization levels. Understand scalability patterns across models and computing platforms.",
            icon: "fa-solid fa-microchip",
            route: "/climate-models/chsy-parallelization"
        },
        {
            id: "jpsy-parallelization",
            title: "JPSY vs Parallelization",
            description: "Explore Joules per Simulated Year energy consumption patterns against CPU count. Evaluate energy efficiency across different parallelization strategies.",
            icon: "fa-solid fa-bolt",
            route: "/climate-models/jpsy-parallelization"
        }
    ];

    const filteredMetrics = metrics.filter(metric =>
        metric.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        metric.description.toLowerCase().includes(searchFilter.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-full bg-primary text-white">
                        <i className="fa-solid fa-globe text-2xl"></i>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-dark dark:text-light">
                            Climate Models Analytics
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            Comprehensive metrics and analytics for climate model usage and performance
                        </p>
                    </div>
                </div>

                {/* Search Filter */}
                <div className="max-w-md">
                    <div className="relative">
                        <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            placeholder="Search metrics..."
                            value={searchFilter}
                            onChange={(e) => setSearchFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-dark dark:text-light focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMetrics.map((metric) => (
                    <MetricCard
                        key={metric.id}
                        title={metric.title}
                        description={metric.description}
                        icon={metric.icon}
                        route={metric.route}
                    />
                ))}
            </div>

            {filteredMetrics.length === 0 && (
                <div className="text-center py-12">
                    <i className="fa-solid fa-search text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-300 mb-2">
                        No metrics found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        Try adjusting your search criteria
                    </p>
                </div>
            )}
        </div>
    );
};

export default ClimateModels;
