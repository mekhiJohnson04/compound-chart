let portfolio = [];

// Get id to give html elements functionality
const form = document.getElementById("portfolio-form")
const id = document.getElementById("portfolio-id");
const assetType = document.getElementById("asset-type");
const symbol = document.getElementById("symbol");
const portfolioAmount = document.getElementById("portfolio-amount");
const purchaseDate = document.getElementById("purchase-date");

// parse or convert into usable structure if there are any portfolio's saved in localstorage and if not returns empty list
 const savedPortfolio = localStorage.getItem('portfolio-form');
    if (savedPortfolio){
        portfolio = JSON.parse(savedPortfolio);
    }
    else {
        portfolio = [];
    }

function renderPortfolioList(list){
    list.innerHTML = '';

    portfolio.forEach(item => {
        list.innerHTML += `
            <div class="portfolio-item">
                <span>${item.assetType} | ${item.symbol} | Qty: ${item.portfolioAmount} | Date: ${item.purchaseDate}</span>
            </div>
        `;
    });
}

// Create form event to give the submit button functionality
form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Clean all of the inputs needed
    const idValue = id.value.trim();
    const assetTypeValue = assetType.value.trim();
    const symbolValue = symbol.value.trim();
    const portfolioAmountValue = parseFloat(portfolioAmount.value);
    const purchaseDateValue = purchaseDate.value.trim(); 

    // Create a new portfolio entry
    const new_asset = {
        id: idValue,
        assetType: assetTypeValue,
        symbol: symbolValue,
        portfolioAmount: portfolioAmountValue,
        purchaseDate: purchaseDateValue
    };

    portfolio.push(new_asset);
    localStorage.setItem('portfolio-form', JSON.stringify(portfolio));

    document.getElementById('portfolio-list') = renderPortfolioList(portfolio);
})
    