import Chart from 'chart.js/auto';
import './style.css';

// Grabs form & elements; to read user input and display results
const form = document.getElementById('interest-form');
const finalAmountSpan = document.getElementById('final-amount');
const chartCanvas = document.getElementById('growthChart');
const priceChartCanvas = document.getElementById('cryptoChart');
let chart;
let prices_chart;

const currencyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      });

// listening for form submissions; this intercepts the form before the browser reloads the page; lets you handle things with Javascript instead
form.addEventListener('submit', function (e) {
  e.preventDefault();

  // collect inputs; reads and parses form values
  const P = parseFloat(document.getElementById('principal').value);
  const r = parseFloat(document.getElementById('interest-rate').value);
  const t = parseInt(document.getElementById('years').value);
  const n = parseInt(document.getElementById('frequency').value);
  const monthly_contribution = parseFloat(document.getElementById('monthly-contribution').value)

  // Validate input; ensures i am sending valid, useful data to the backend
  if (isNaN(P) || isNaN(r) || isNaN(t) || isNaN(n)) {
    alert("Please enter a valid number.");
    return;
  }

  // fetch API; sending the request; this is how JS calls the backend, sending data and waiting for a reply
  fetch("http://localhost:8000/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      principal: P,
      rate: r,
      years: t,
      frequency: n,
      monthly_contribution: monthly_contribution  // names have to match when trying to fetch domains from backend

    })
  })
    // handling the response; parses the backend's JSON reply
    .then(response => response.json())
    // updates the UI
    .then(data => {
      const finalAmount = data.finalAmount;
      const chartValues = data.chartValues;

      finalAmountSpan.textContent = currencyFormatter.format(finalAmount);

      const labels = chartValues.map((_, i) => {
        if (n === 365) return `Day ${i + 1}`;
        if (n === 12) return `Month ${i + 1}`;
        if (n === 4) return `Q${i + 1}`;
        return `Year ${i + 1}`;
      });

      if (chart) chart.destroy();

      chart = new Chart(chartCanvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Investment Growth',
            data: chartValues,
            backgroundColor: ['red','green','blue','orange','brown','purple'],
            borderColor: 'grey',
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          }
        }
      });
    })
    .catch(error => {
      console.error("Error:", error);
      alert("An error occurred. Make sure your backend server is running.");
    });
});

const cryptoForm = document.getElementById('crypto-form');
const cryptoPriceSpan = document.getElementById('crypto-amount');

cryptoForm.addEventListener('submit', function(e) {
    let cryptoInput = document.getElementById('crypto-price').value;
    const cleanedInput = cryptoInput.trim();

    console.log(cleanedInput);

    fetch("http://localhost:8000/fetch", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            crypto_name: cleanedInput
        })
    }).then(response => response.json()).then(data => {
        const cryptoPrice = data.cryptoPrice;
        const priceChartValues = data.priceChartValues;
        const chartDates = data.chartDates;


        cryptoPriceSpan.textContent = currencyFormatter.format(cryptoPrice); 

        //const priceChartLabels = priceChartValues.map((_, i) => {
            //if (cleanedInput) return chartDates;
        //});

        if (prices_chart) prices_chart.destroy();

        prices_chart = new Chart(priceChartCanvas, {
            type: "line",
            data: {
                labels: chartDates,
                datasets: [{
                    label: 'Historical Price Chart (USD)',
                    data: priceChartValues,
                    backgroundColor: ['red','green','blue','orange','brown','purple'],
                    borderColor: 'grey',
                    borderWidth: 1.5
                }]
            }, 
            options: {
                responsive: true,
                animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                }
            }
        });
    })
    .catch(error => {
        console.error("Error:", error);
        alert("An error occured. Make sure your backend is running.")
    });
});
