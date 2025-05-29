import "./News.css";
import React from "react";

// NewsItem 타입을 News.tsx 내에 중복 정의 (혹은 any로 처리)
interface NewsItem {
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

interface NewsProps {
    news: NewsItem[];
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    loading: boolean;
    error: string;
}

const News: React.FC<NewsProps> = ({ news, currentPage, totalPages, onPageChange, loading, error }) => {
    // 페이지네이션 버튼 최대 5개만 노출
    const getPageNumbers = () => {
        const maxButtons = 5;
        let start = Math.max(1, currentPage - 2);
        let end = Math.min(totalPages, start + maxButtons - 1);
        if (end - start < maxButtons - 1) {
            start = Math.max(1, end - maxButtons + 1);
        }
        const pages = [];
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };
    const pageNumbers = getPageNumbers();
    return (
        <div id="news-layout">
            <h3>관련 뉴스</h3>
            {loading && <div>뉴스 로딩 중...</div>}
            {error && <div style={{ color: "red" }}>뉴스 오류: {error}</div>}
            {!loading && !error && (
                <>
                    <ul className="news-list">
                        {news.map((item, idx) => (
                            <li key={item.url + item.date} className="news-item">
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-title">
                                    {item.title}
                                </a>
                                <div className="news-date">{item.date}</div>
                                <div className="news-direction">예상 가격 방향: {item.predicted_price_direction}</div>
                            </li>
                        ))}
                    </ul>
                    <div className="news-pagination">
                        {/* 왼쪽 화살표 */}
                        {pageNumbers[0] > 1 && (
                            <button onClick={() => onPageChange(pageNumbers[0] - 1)}>&#x25C0;</button>
                        )}
                        {pageNumbers.map((page) => (
                            <button
                                key={page}
                                className={page === currentPage ? "active" : ""}
                                onClick={() => onPageChange(page)}
                                disabled={page === currentPage}
                            >
                                {page}
                            </button>
                        ))}
                        {/* 오른쪽 화살표 */}
                        {pageNumbers[pageNumbers.length - 1] < totalPages && (
                            <button onClick={() => onPageChange(pageNumbers[pageNumbers.length - 1] + 1)}>
                                &#x25B6;
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default News;
