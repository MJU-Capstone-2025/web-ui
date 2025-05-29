import React, { useState, useEffect, useRef } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
    Legend,
} from "recharts";
import "./Graph.css";

interface PriceData {
    Date: string;
    Actual_Price?: number;
    Predicted_Price?: number;
    Predicted_Price_7?: number;
}

interface GraphProps {
    predictions14: PriceData[];
    predictions7: PriceData[];
}

const Graph: React.FC<GraphProps> = ({ predictions14, predictions7 }) => {
    const [range, setRange] = useState<"2w" | "1m" | "3m" | "6m" | "1y">("2w");
    const [scrollIndex, setScrollIndex] = useState<number>(0);
    const graphContainerRef = useRef<HTMLDivElement>(null);

    // 두 예측 데이터를 날짜 기준으로 합치기 (Actual_Price는 14일 예측 기준)
    const mergedData: PriceData[] = (() => {
        const map = new Map<string, PriceData>();
        predictions14.forEach((item) => {
            map.set(item.Date, { ...item });
        });
        predictions7.forEach((item) => {
            if (map.has(item.Date)) {
                map.set(item.Date, {
                    ...map.get(item.Date)!,
                    Predicted_Price_7: item.Predicted_Price,
                });
            } else {
                map.set(item.Date, {
                    Date: item.Date,
                    Predicted_Price_7: item.Predicted_Price,
                });
            }
        });
        // 타입 확장: Predicted_Price_7 추가
        return Array.from(map.values()).sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
    })();

    // 범위별 표시할 데이터 개수 설정 (화면 밀도)
    const getDisplayCount = (range: "2w" | "1m" | "3m" | "6m" | "1y"): number => {
        switch (range) {
            case "2w":
                return 14;
            case "1m":
                return 30;
            case "3m":
                return 90;
            case "6m":
                return 180;
            case "1y":
                return 365;
        }
    };

    const displayCount = getDisplayCount(range);
    const maxScrollIndex = Math.max(0, mergedData.length - displayCount);
    const actualScrollIndex = Math.min(scrollIndex, maxScrollIndex);

    // 스크롤 인덱스에 따라 표시할 데이터 슬라이스
    const filteredData = mergedData.slice(actualScrollIndex, actualScrollIndex + displayCount);

    const todayStr = new Date().toISOString().split("T")[0];

    // 범위 변경 시 최신 데이터로 이동
    const handleRangeChange = (newRange: "2w" | "1m" | "3m" | "6m" | "1y") => {
        setRange(newRange);
        const newDisplayCount = getDisplayCount(newRange);
        const newMaxScrollIndex = Math.max(0, mergedData.length - newDisplayCount);
        setScrollIndex(newMaxScrollIndex);
    };

    useEffect(() => {
        const container = graphContainerRef.current;
        if (!container) return;
        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (mergedData.length <= displayCount) return;
            const scrollStep = Math.max(1, Math.floor(displayCount / 20));
            const direction = e.deltaY > 0 ? 1 : -1;
            setScrollIndex((prev) => {
                const newIndex = Math.max(0, Math.min(maxScrollIndex, prev + direction * scrollStep));
                return newIndex;
            });
        };
        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => {
            container.removeEventListener("wheel", handleWheel);
        };
    }, [mergedData.length, displayCount, maxScrollIndex]);

    useEffect(() => {
        if (mergedData.length > 0) {
            const newMaxScrollIndex = Math.max(0, mergedData.length - displayCount);
            setScrollIndex(newMaxScrollIndex);
        }
    }, [mergedData.length, displayCount]);

    return (
        <div id="graph-layout">
            <div className="range-buttons">
                <button
                    className={`range-button ${range === "2w" ? "active" : ""}`}
                    onClick={() => handleRangeChange("2w")}
                >
                    2주
                </button>
                <button
                    className={`range-button ${range === "1m" ? "active" : ""}`}
                    onClick={() => handleRangeChange("1m")}
                >
                    1개월
                </button>
                <button
                    className={`range-button ${range === "3m" ? "active" : ""}`}
                    onClick={() => handleRangeChange("3m")}
                >
                    3개월
                </button>
                <button
                    className={`range-button ${range === "6m" ? "active" : ""}`}
                    onClick={() => handleRangeChange("6m")}
                >
                    6개월
                </button>
                <button
                    className={`range-button ${range === "1y" ? "active" : ""}`}
                    onClick={() => handleRangeChange("1y")}
                >
                    1년
                </button>
            </div>
            <div
                ref={graphContainerRef}
                style={{
                    cursor: "grab",
                    touchAction: "none",
                    userSelect: "none",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <ResponsiveContainer id="graph-container" width="100%" height={300}>
                    <LineChart data={filteredData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="Date"
                            tickFormatter={(date) => date.slice(5).replace("-", "/")}
                            tick={{ fontSize: 12 }}
                        />
                        <YAxis
                            domain={["auto", "auto"]}
                            tick={{ fontSize: 12 }}
                            orientation="right"
                            tickFormatter={(price) => price?.toFixed(2)}
                        />
                        <Tooltip
                            formatter={(value: number) => value?.toFixed(2)}
                            labelFormatter={(label) => `날짜: ${label}`}
                        />
                        <Legend />
                        <ReferenceLine x={todayStr} stroke="#666" strokeDasharray="3 3" />
                        <Line
                            type="monotone"
                            dataKey="Actual_Price"
                            stroke="#2196F3"
                            name="실제 가격"
                            dot={range === "2w" || range === "1m" ? { r: 2 } : false}
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="Predicted_Price"
                            stroke="#FF5722"
                            name="예측 가격(14일)"
                            strokeDasharray="5 5"
                            dot={range === "2w" || range === "1m" ? { r: 2 } : false}
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="Predicted_Price_7"
                            stroke="#4CAF50"
                            name="예측 가격(7일)"
                            strokeDasharray="2 2"
                            dot={range === "2w" || range === "1m" ? { r: 2 } : false}
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default Graph;
