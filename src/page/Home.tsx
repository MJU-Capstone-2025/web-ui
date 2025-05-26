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
    apiEndpoint: string;
}

const commodityOptions: CommodityOption[] = [
    { value: "coffee", label: "커피", apiEndpoint: "/prediction" },
    { value: "wheat", label: "밀", apiEndpoint: "/prediction/wheat" },
    { value: "rice", label: "쌀", apiEndpoint: "/prediction/rice" },
    { value: "corn", label: "옥수수", apiEndpoint: "/prediction/corn" },
    { value: "soybean", label: "대두", apiEndpoint: "/prediction/soybean" },
];

const Home: React.FC = () => {
    const [predictions, setPredictions] = useState<PriceData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [selectedCommodity, setSelectedCommodity] = useState<CommodityType>("coffee");

    const fetchData = (commodity: CommodityType = selectedCommodity) => {
        setLoading(true);
        setError("");

        const selectedOption = commodityOptions.find((option) => option.value === commodity);
        const endpoint = selectedOption?.apiEndpoint || "/prediction";

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
        fetchData(newCommodity);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="layout" id="home-layout">
            <div className="wrapper">
                <Header />

                {/* 식료품 선택 컴포넌트 */}
                <div className="commodity-selector">
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
                    {loading && <span className="loading-indicator">로딩 중...</span>}
                    {error && <span className="error-indicator">오류: {error}</span>}
                </div>

                <Graph predictions={predictions} />
                <News />
            </div>
        </div>
    );
};

export default Home;
