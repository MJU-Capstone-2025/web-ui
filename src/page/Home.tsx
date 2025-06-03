import React, { useEffect, useState } from "react";
import Graph from "../components/Graph";
import Header from "../components/Header";
import News from "../components/News";
import "./Home.css";

export interface NewsItem {
    date: string;
    title: string;
    url: string;
    is_price_related: boolean;
    preprocessed_title: string;
    positive_sentiment: number;
    negative_sentiment: number;
    neutral_sentiment: number;
    rise_present: number;
    increase_present: number;
    jump_present: number;
    surge_present: number;
    climb_present: number;
    fall_present: number;
    drop_present: number;
    decrease_present: number;
    decline_present: number;
    plunge_present: number;
    weighted_positive_sentiment: number;
    weighted_negative_sentiment: number;
    predicted_price_direction: string;
}

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

const NEWS_PER_PAGE = 5;

const Home: React.FC = () => {
    const [predictions14, setPredictions14] = useState<PriceData[]>([]);
    const [predictions7, setPredictions7] = useState<PriceData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [selectedCommodity, setSelectedCommodity] = useState<CommodityType>("coffee");
    const [devMode, setDevMode] = useState<boolean>(true);

    // 뉴스 관련 상태
    const [news, setNews] = useState<NewsItem[]>([]);
    const [newsLoading, setNewsLoading] = useState<boolean>(true);
    const [newsError, setNewsError] = useState<string>("");
    const [newsPage, setNewsPage] = useState<number>(1);

    const getApiEndpoint = (commodity: CommodityType, dev: boolean) => {
        const base = dev ? "/prediction-dev" : "/prediction";
        return commodity === "coffee" ? base : `${base}/${commodity}`;
    };

    const fetchData = (commodity: CommodityType = selectedCommodity, dev: boolean = devMode) => {
        setLoading(true);
        setError("");
        const endpoint = getApiEndpoint(commodity, dev);
        fetch(`http://127.0.0.1:8000${endpoint}`)
            .then((res) => {
                if (!res.ok) {
                    throw new Error("네트워크 오류");
                }
                return res.json();
            })
            .then((response) => {
                setPredictions14(response.data.prediction_result_14days || []);
                setPredictions7(response.data.prediction_result_7days || []);
                setLoading(false);
                console.log(response.data);
            })
            .catch((err: Error) => {
                setError(err.message);
                setLoading(false);
            });
    };

    // 뉴스 데이터 fetch
    useEffect(() => {
        setNewsLoading(true);
        setNewsError("");
        fetch("http://127.0.0.1:8000/news")
            .then((res) => {
                if (!res.ok) throw new Error("뉴스 API 오류");
                return res.json();
            })
            .then((response) => {
                setNews(response.data || []);
                setNewsLoading(false);
            })
            .catch((err: Error) => {
                setNewsError(err.message);
                setNewsLoading(false);
            });
    }, []);

    const totalNewsPages = Math.ceil(news.length / NEWS_PER_PAGE);
    const pagedNews = news.slice((newsPage - 1) * NEWS_PER_PAGE, newsPage * NEWS_PER_PAGE);
    const handleNewsPageChange = (page: number) => setNewsPage(page);

    const handleCommodityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newCommodity = event.target.value as CommodityType;
        setSelectedCommodity(newCommodity);
        fetchData(newCommodity, devMode);
    };

    const handleDevModeToggle = () => {
        setDevMode((prev) => {
            const newDev = !prev;
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
                        {/* <div className="devmode-toggle-wrapper">
                            <span className="devmode-toggle-label">단기간 예측 모델</span>
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
                        </div> */}
                    </div>
                </div>
                <Graph predictions14={predictions14} predictions7={predictions7} />
                <News
                    news={pagedNews}
                    currentPage={newsPage}
                    totalPages={totalNewsPages}
                    onPageChange={handleNewsPageChange}
                    loading={newsLoading}
                    error={newsError}
                />
            </div>
        </div>
    );
};

export default Home;
