let portfolio = [];

// Get references to the form and its input elements
const form = document.getElementById("portfolio-form");
const assetType = document.getElementById("asset-type");
const symbol = document.getElementById("symbol");
const portfolioAmount = document.getElementById("portfolio-amount");
const purchaseDate = document.getElementById("purchase-date");

// Reference to the container where the portfolio list will be shown
const portfolioList = document.getElementById("portfolio-list");

// Try to load any saved portfolio from localStorage on page load
const savedPortfolio = localStorage.getItem('portfolio-form');
if (savedPortfolio) {
    portfolio = JSON.parse(savedPortfolio);
} else {
    portfolio = [];
}

// Function to render the portfolio list on the page
function renderPortfolioList() {
    // Clear previous contents
    portfolioList.innerHTML = '';

    // If portfolio is empty, show a message
    if (portfolio.length === 0) {
        portfolioList.innerHTML = '<p>No assets added yet.</p>';
        return;
    }

    // Render each asset as a div (you can use a <ul> if you prefer)
    portfolio.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'portfolio-item';
        itemDiv.innerHTML = `
            <span>
                ${item.assetType} | ${item.symbol.toUpperCase()} | Qty: ${item.portfolioAmount} | Date: ${item.purchaseDate}
            </span>
        `;
        portfolioList.appendChild(itemDiv);
    });
}

// Show list on first load
renderPortfolioList();

// Handle form submissions
form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Read and clean input values
    const assetTypeValue = assetType.value.trim();
    const symbolValue = symbol.value.trim();
    const portfolioAmountValue = parseFloat(portfolioAmount.value);
    const purchaseDateValue = purchaseDate.value.trim();

    fetch("http://localhost:8000/list", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        },

        // These property names must match the Pydantic model in the backend in order for the 
        // communication to work
        body: JSON.stringify({
            assetType: assetTypeValue,
            symbol: symbolValue,
            shareAmount: portfolioAmountValue,
            purchaseDate: purchaseDateValue
        })
    }).then(response => response.json())
    .then(data => {
        const assetType = data.assetType;
        const symbol = data.symbol;
        const shareAmount = data.shareAmount;
        const purchaseDate = data.purchaseDate;
    })
    // Build a new asset object
    const newAsset = {
        assetType: assetTypeValue,
        symbol: symbolValue,
        portfolioAmount: portfolioAmountValue,
        purchaseDate: purchaseDateValue
    };

    // Add to portfolio array
    portfolio.push(newAsset);

    // Save back to localStorage
    localStorage.setItem('portfolio-form', JSON.stringify(portfolio));

    // Re-render the updated list
    renderPortfolioList();

    // Optionally clear the form
    form.reset();
});
