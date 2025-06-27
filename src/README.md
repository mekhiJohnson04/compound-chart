# projects

# 📈 All Things Finance: Compound Interest & Crypto Dashboard

A modern web application that helps you visualize long-term investment growth with compound interest and analyze the historical price of cryptocurrencies using live data from the CoinGecko API.

## Features

- **Compound Interest Calculator**
  - Enter your principal, annual rate, time horizon, contribution, and compounding frequency.
  - Visualizes growth as a dynamic bar/line chart.
- **Crypto Price Tracker**
  - Instantly fetches live prices for major cryptocurrencies.
  - Displays historical price charts (last 30 days) for any coin supported by CoinGecko.
- **Responsive UI**
  - Fully responsive, clean dark theme.
  - Side-by-side or stacked panels depending on screen size.
- **Live Data**
  - Backend built with FastAPI; handles secure calculations and crypto data aggregation.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript, Chart.js, Vite
- **Backend:** FastAPI (Python), Pandas, Requests
- **API:** [CoinGecko](https://www.coingecko.com/en/api)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (for frontend via Vite)
- Python 3.8+ (for backend)
- Pip for dependencies