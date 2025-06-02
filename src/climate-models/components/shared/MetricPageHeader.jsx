import { Link } from "react-router-dom";

const MetricPageHeader = ({ 
    icon, 
    title, 
    description, 
    backRoute = "/climate-models" 
}) => {
    return (
        <div className="bg-white dark:bg-neutral-700 rounded-lg p-6 border border-gray-200 dark:border-neutral-600">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <i className={icon}></i>
                    <div>
                        <h1 className="text-2xl font-bold text-dark dark:text-light mb-2">
                            {title}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300">
                            {description}
                        </p>
                    </div>
                </div>
                <Link 
                    to={backRoute}
                    className="btn btn-light dark:btn-dark"
                >
                    <i className="fa-solid fa-arrow-left mr-2"></i>
                    Back to Metrics
                </Link>
            </div>
        </div>
    );
};

export default MetricPageHeader;