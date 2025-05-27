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
}

interface GraphProps {
    predictions: PriceData[];
}

const Graph: React.FC<GraphProps> = ({ predictions }) => {
    const [range, setRange] = useState<"2w" | "1m" | "3m" | "6m" | "1y">("2w");
    const [scrollIndex, setScrollIndex] = useState<number>(0);
    const graphContainerRef = useRef<HTMLDivElement>(null);

    // 전체 데이터를 날짜순으로 정렬 (오래된 것부터)
    const sortedData = [...predictions].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

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
    const maxScrollIndex = Math.max(0, sortedData.length - displayCount);
    const actualScrollIndex = Math.min(scrollIndex, maxScrollIndex);

    // 스크롤 인덱스에 따라 표시할 데이터 슬라이스
    const filteredData = sortedData.slice(actualScrollIndex, actualScrollIndex + displayCount);

    console.log("전체 데이터:", predictions.length);
    console.log("표시 데이터:", filteredData.length);
    console.log("스크롤 인덱스:", actualScrollIndex, "최대:", maxScrollIndex);

    const todayStr = new Date().toISOString().split("T")[0];

    // 범위 변경 시 최신 데이터로 이동
    const handleRangeChange = (newRange: "2w" | "1m" | "3m" | "6m" | "1y") => {
        setRange(newRange);
        // 새로운 범위의 최대 스크롤 인덱스로 설정 (최신 데이터 표시)
        const newDisplayCount = getDisplayCount(newRange);
        const newMaxScrollIndex = Math.max(0, sortedData.length - newDisplayCount);
        setScrollIndex(newMaxScrollIndex);
    };

    // useEffect로 직접 wheel 이벤트 처리
    useEffect(() => {
        const container = graphContainerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (sortedData.length <= displayCount) return;

            const scrollStep = Math.max(1, Math.floor(displayCount / 20)); // 스크롤 속도 조절
            const direction = e.deltaY > 0 ? 1 : -1; // 위로 굴리면 과거(-1), 아래로 굴리면 미래(+1)

            setScrollIndex((prev) => {
                const newIndex = Math.max(0, Math.min(maxScrollIndex, prev + direction * scrollStep));
                return newIndex;
            });
        };

        container.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            container.removeEventListener("wheel", handleWheel);
        };
    }, [sortedData.length, displayCount, maxScrollIndex]);

    // 컴포넌트 마운트 시 최신 데이터로 초기화
    useEffect(() => {
        if (sortedData.length > 0) {
            const newMaxScrollIndex = Math.max(0, sortedData.length - displayCount);
            setScrollIndex(newMaxScrollIndex);
        }
    }, [sortedData.length, displayCount]);

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
                        <ReferenceLine
                            x={todayStr}
                            stroke="#666"
                            strokeDasharray="3 3"
                            // label={{ value: "오늘", fill: "#666", fontSize: 12 }}
                        />
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
                            name="예측 가격"
                            strokeDasharray="5 5"
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
