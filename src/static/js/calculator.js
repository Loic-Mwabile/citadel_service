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
const modeButtons = document.querySelectorAll('.mode-btn');
const currencySymbol = document.querySelector('.currency-symbol');
const equivalentAmountLabel = document.getElementById('equivalentAmountLabel');

// State
let currentMode = 'inr'; // 'inr' or 'usd'

// Validate Input
function validateInput(amount) {
    if (isNaN(amount) || amount <= 0) {
        throw new Error('Please enter a valid transfer amount.');
    }
    return true;
}

// Calculate Transfer Fee (INR to USD)
function calculateInrToUsd(inrAmount) {
    // Ensure input is a number and round to 2 decimal places
    inrAmount = Number(Number(inrAmount).toFixed(2));
    validateInput(inrAmount);

    // Find the appropriate fee tier
    const tier = FEE_TIERS.find(t => inrAmount >= t.min && inrAmount <= t.max);
    if (!tier) throw new Error('Unable to determine fee tier.');

    // Calculate amounts
    const feeAmount = Number((inrAmount * tier.rate).toFixed(2));
    const totalAmount = Number((inrAmount + feeAmount).toFixed(2));
    const usdAmount = Number((inrAmount / EXCHANGE_RATE).toFixed(2));

    return {
        feeRate: tier.rate * 100,
        feeAmount,
        totalAmount,
        usdAmount,
        inputAmount: inrAmount
    };
}

// Calculate USD to INR with fees
function calculateUsdToInr(usdAmount) {
    // Ensure input is a number and round to 2 decimal places
    usdAmount = Number(Number(usdAmount).toFixed(2));
    validateInput(usdAmount);

    // Convert USD to INR (without fees)
    const inrAmount = Number((usdAmount * EXCHANGE_RATE).toFixed(2));
    
    // Find the appropriate fee tier
    const tier = FEE_TIERS.find(t => inrAmount >= t.min && inrAmount <= t.max);
    if (!tier) throw new Error('Unable to determine fee tier.');
    
    // Calculate fee and total amount
    const feeRate = tier.rate;
    // To find the required INR to get the desired USD after fees:
    // inrAfterFees = inrAmount
    // inrBeforeFees = inrAfterFees / (1 - feeRate)
    const inrBeforeFees = Number((inrAmount / (1 - feeRate)).toFixed(2));
    const feeAmount = Number((inrBeforeFees - inrAmount).toFixed(2));

    return {
        feeRate: feeRate * 100,
        feeAmount,
        totalAmount: inrBeforeFees,
        usdAmount,
        inputAmount: usdAmount
    };
}

// Update UI with calculation results
function updateResultsUI(results) {
    const isUsdMode = currentMode === 'usd';
    
    // Format numbers with thousand separators
    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        }).format(num);
    };

    // Update the results display
    feePercentageSpan.textContent = `${results.feeRate.toFixed(1)}%`;
    feeAmountSpan.textContent = `₹${formatNumber(results.feeAmount)}`;
    
    if (isUsdMode) {
        totalAmountSpan.textContent = `₹${formatNumber(results.totalAmount)}`;
        // Show equivalent amount in rupees when in USD mode
        const equivalentInr = results.inputAmount * EXCHANGE_RATE;
        usdAmountSpan.textContent = `$${formatNumber(results.inputAmount)} (₹${formatNumber(equivalentInr)})`;
    } else {
        totalAmountSpan.textContent = `₹${formatNumber(results.totalAmount)}`;
        usdAmountSpan.textContent = `$${formatNumber(results.usdAmount)}`;
    }
}

// Update input field based on mode
function updateInputMode() {
    const isUsdMode = currentMode === 'usd';
    
    // Update button states
    modeButtons.forEach(btn => {
        if (btn.dataset.mode === currentMode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update currency symbol and placeholder
    currencySymbol.textContent = isUsdMode ? '$' : '₹';
    transferAmountInput.placeholder = `Enter amount (${isUsdMode ? 'USD' : 'INR'})`;
    
    // Update equivalent amount label
    equivalentAmountLabel.textContent = isUsdMode 
        ? 'Amount to Send' 
        : 'Equivalent Amount (USD)';
    
    // Clear and reset the input
    transferAmountInput.value = '';
    resetResults();
    
    // Focus the input field
    transferAmountInput.focus();
}

// Handle mode toggle
modeButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentMode = button.dataset.mode;
        updateInputMode();
    });
});

// Reset results to default state
function resetResults() {
    feePercentageSpan.textContent = '-';
    feeAmountSpan.textContent = '-';
    totalAmountSpan.textContent = '-';
    usdAmountSpan.textContent = '-';
}

// Calculate and update results based on current mode
function calculateAndUpdate() {
    const amount = parseFloat(transferAmountInput.value);
    
    // If input is empty or invalid, reset results
    if (isNaN(amount) || amount <= 0) {
        resetResults();
        return;
    }
    
    try {
        let results;
        if (currentMode === 'usd') {
            results = calculateUsdToInr(amount);
        } else {
            results = calculateInrToUsd(amount);
        }
        updateResultsUI(results);
    } catch (error) {
        console.error('Calculation error:', error);
        resetResults();
    }
}

// Real-time calculation as user types
transferAmountInput.addEventListener('input', () => {
    // Only calculate if there's a value
    if (transferAmountInput.value && transferAmountInput.value.trim() !== '') {
        calculateAndUpdate();
    } else {
        resetResults();
    }
});

// Prevent form submission on Enter key
transferForm.addEventListener('submit', (e) => {
    e.preventDefault();
    return false;
});

// Initialize the input mode
updateInputMode();
