// Constants
const EXCHANGE_RATE = 83.5; // ₹83.5 = $1
const FEE_TIERS = [
    { min: 0, max: 8350, rate: 0.03 },
    { min: 8351, max: 12500, rate: 0.04 },
    { min: 12501, max: 16700, rate: 0.045 },
    { min: 16701, max: Infinity, rate: 0.05 }
];

// DOM Elements
const transferForm = document.getElementById('transferForm');
const transferAmountInput = document.getElementById('transferAmount');
const feePercentageSpan = document.getElementById('feePercentage');
const feeAmountSpan = document.getElementById('feeAmount');
const totalAmountSpan = document.getElementById('totalAmount');
const usdAmountSpan = document.getElementById('usdAmount');

// Validate Input
function validateInput(amount) {
    if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid transfer amount.');
    }
}

// Calculate Transfer Fee
function calculateTransferFee(amount) {
    // Ensure input is a number and round to 2 decimal places
    amount = Number(Number(amount).toFixed(2));

    // Validate input
    validateInput(amount);

    // Find the appropriate fee tier
    const tier = FEE_TIERS.find(t => amount >= t.min && amount <= t.max);

    if (!tier) {
        throw new Error('Unable to determine fee tier.');
    }

    // Calculate fee and total amount with precise rounding
    const feeAmount = Number((amount * tier.rate).toFixed(2));
    const totalAmount = Number((amount + feeAmount).toFixed(2));
    const usdAmount = Number((amount / EXCHANGE_RATE).toFixed(2));

    return {
        feeRate: (tier.rate * 100).toFixed(1),
        feeAmount: feeAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        usdAmount: usdAmount.toFixed(2)
    };
}

// Update UI with calculation results
function updateResultsUI(results) {
    feePercentageSpan.textContent = `${results.feeRate}%`;
    feeAmountSpan.textContent = `₹${results.feeAmount}`;
    totalAmountSpan.textContent = `₹${results.totalAmount}`;
    usdAmountSpan.textContent = `$${results.usdAmount}`;
}

// Reset results to default state
function resetResults() {
    feePercentageSpan.textContent = '-';
    feeAmountSpan.textContent = '-';
    totalAmountSpan.textContent = '-';
    usdAmountSpan.textContent = '-';
}

// Form submission event listener
transferForm.addEventListener('submit', function(e) {
    // Prevent the default form submission
    e.preventDefault();
    e.stopPropagation();
    
    // Get transfer amount
    const transferAmount = parseFloat(transferAmountInput.value);
    
    // Validate input
    if (isNaN(transferAmount) || transferAmount <= 0) {
        alert('Please enter a valid transfer amount.');
        resetResults();
        return false;
    }
    
    try {
        // Calculate and update results
        const results = calculateTransferFee(transferAmount);
        updateResultsUI(results);
    } catch (error) {
        // Handle any unexpected errors
        alert(error.message);
        resetResults();
    }
    
    // Prevent form submission
    return false;
}, false);
