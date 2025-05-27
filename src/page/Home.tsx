import React, { useEffect, useState } from "react";
import Graph from "../components/Graph";
import Header from "../components/Header";
import News from "../components/News";
import "./Home.css";

interface PriceData {
    Date: string;
    Predicted_Price?: number;
    Actual_Price?: number;
}

type CommodityType = "coffee" | "wheat" | "rice" | "corn" | "soybean";

interface CommodityOption {
    value: CommodityType;
    label: string;
}

const commodityOptions: CommodityOption[] = [
    { value: "coffee", label: "커피" },
    { value: "wheat", label: "밀" },
    { value: "rice", label: "쌀" },
    { value: "corn", label: "옥수수" },
    { value: "soybean", label: "대두" },
];

const Home: React.FC = () => {
    const [predictions, setPredictions] = useState<PriceData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [selectedCommodity, setSelectedCommodity] = useState<CommodityType>("coffee");
    const [devMode, setDevMode] = useState<boolean>(true);

    const getApiEndpoint = (commodity: CommodityType) => {
        const base = devMode ? "/prediction-dev" : "/prediction";
        return commodity === "coffee" ? base : `${base}/${commodity}`;
    };

    const fetchData = (commodity: CommodityType = selectedCommodity, dev: boolean = devMode) => {
        setLoading(true);
        setError("");
        const endpoint = getApiEndpoint(commodity);
        fetch(`http://127.0.0.1:8000${endpoint}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("네트워크 오류");
                }
                return res.json();
            })
            .then((response) => {
                setPredictions(response.data);
                setLoading(false);
                console.log(response.data);
            })
            .catch((err: Error) => {
                setError(err.message);
                setLoading(false);
            });
    };

    const handleCommodityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newCommodity = event.target.value as CommodityType;
        setSelectedCommodity(newCommodity);
        fetchData(newCommodity, devMode);
    };

    const handleDevModeToggle = () => {
        setDevMode((prev) => {
            const newDev = !prev;
            // dev 모드가 바뀌면 현재 선택된 commodity로 다시 fetch
            fetchData(selectedCommodity, newDev);
            return newDev;
        });
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    return (
        <div className="layout" id="home-layout">
            <div className="wrapper">
                <Header />
                {/* 식료품 선택 및 개발자 모드 토글 */}
                <div className="commodity-selector">
                    <div className="commodity-selector-left">
                        <label htmlFor="commodity-select" className="commodity-label">
                            식료품 선물:
                        </label>
                        <select
                            id="commodity-select"
                            value={selectedCommodity}
                            onChange={handleCommodityChange}
                            className="commodity-select"
                            disabled={loading}
                        >
                            {commodityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="commodity-selector-right">
                        {loading && <span className="loading-indicator">로딩 중...</span>}
                        {error && <span className="error-indicator">오류: {error}</span>}
                        <div className="devmode-toggle-wrapper">
                            <span className="devmode-toggle-label">개발자 모드</span>
                            <input
                                type="checkbox"
                                id="devmode-toggle"
                                className="devmode-toggle-input"
                                checked={devMode}
                                onChange={handleDevModeToggle}
                                disabled={loading}
                            />
                            <label htmlFor="devmode-toggle" className="devmode-toggle-switch">
                                <span className="devmode-toggle-slider" />
                            </label>
                            <span className="devmode-toggle-status">{devMode ? "ON" : "OFF"}</span>
                        </div>
                    </div>
                </div>
                <Graph predictions={predictions} />
                <News />
            </div>
        </div>
    );
};

export default Home;
