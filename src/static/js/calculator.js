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
const inrToUsdBtn = document.getElementById('inrToUsdBtn');
const usdToInrBtn = document.getElementById('usdToInrBtn');
const inrInputGroup = document.getElementById('inrInputGroup');
const usdInputGroup = document.getElementById('usdInputGroup');
const inrAmountInput = document.getElementById('inrAmount');
const usdAmountInput = document.getElementById('usdAmountInput');

// Result elements
const feePercentageSpan = document.getElementById('feePercentage');
const feeAmountSpan = document.getElementById('feeAmount');
const totalAmountSpan = document.getElementById('totalAmount');
const equivalentAmountSpan = document.getElementById('equivalentAmount');
const totalLabel = document.getElementById('totalLabel');
const equivalentLabel = document.getElementById('equivalentLabel');

// State
let isInrToUsd = true;

// Initialize the calculator
function initCalculator() {
    // Set up event listeners
    inrToUsdBtn.addEventListener('click', () => switchMode(true));
    usdToInrBtn.addEventListener('click', () => switchMode(false));
    inrAmountInput.addEventListener('input', () => handleInput('inr'));
    usdAmountInput.addEventListener('input', () => handleInput('usd'));
    
    // Set initial state
    switchMode(true);
    
    // Trigger initial calculation if there's a value
    if (inrAmountInput.value) {
        handleInput('inr');
    }
}

// Switch between INR to USD and USD to INR modes
function switchMode(toInrToUsd) {
    isInrToUsd = toInrToUsd;
    
    // Update active state of toggle buttons
    inrToUsdBtn.classList.toggle('active', isInrToUsd);
    usdToInrBtn.classList.toggle('active', !isInrToUsd);
    
    // Show/hide input groups
    inrInputGroup.style.display = isInrToUsd ? 'block' : 'none';
    usdInputGroup.style.display = isInrToUsd ? 'none' : 'block';
    
    // Update labels
    if (isInrToUsd) {
        totalLabel.textContent = 'Total to Pay';
        equivalentLabel.textContent = 'Will Receive';
        // Focus on the active input
        inrAmountInput.focus();
    } else {
        totalLabel.textContent = 'Total to Pay (INR)';
        equivalentLabel.textContent = 'Amount to Send (USD)';
        // Focus on the active input
        usdAmountInput.focus();
    }
    
    // Recalculate based on current input
    const activeInput = isInrToUsd ? inrAmountInput : usdAmountInput;
    if (activeInput.value) {
        handleInput(isInrToUsd ? 'inr' : 'usd');
    } else {
        resetResults();
    }
}

// Handle input changes
function handleInput(inputType) {
    const input = inputType === 'inr' ? inrAmountInput : usdAmountInput;
    const value = parseFloat(input.value);
    
    if (isNaN(value) || value <= 0) {
        resetResults();
        return;
    }
    
    if (inputType === 'inr') {
        calculateInrToUsd(value);
    } else {
        calculateUsdToInr(value);
    }
}

// Calculate from INR to USD
function calculateInrToUsd(inrAmount) {
    const tier = FEE_TIERS.find(t => inrAmount >= t.min && inrAmount <= t.max) || FEE_TIERS[FEE_TIERS.length - 1];
    const feeAmount = inrAmount * tier.rate;
    const totalInr = inrAmount + feeAmount;
    const usdAmount = inrAmount / EXCHANGE_RATE;
    
    updateResults({
        feeRate: tier.rate * 100,
        feeAmount,
        totalAmount: totalInr,
        equivalentAmount: usdAmount,
        currency: 'USD',
        showInrTotal: false
    });
    
    // Update USD input field without triggering event
    usdAmountInput.removeEventListener('input', handleUsdInput);
    usdAmountInput.value = usdAmount.toFixed(2);
    usdAmountInput.addEventListener('input', handleUsdInput);
}

// Calculate from USD to INR
function calculateUsdToInr(usdAmount) {
    const inrAmount = usdAmount * EXCHANGE_RATE;
    const tier = FEE_TIERS.find(t => inrAmount >= t.min && inrAmount <= t.max) || FEE_TIERS[FEE_TIERS.length - 1];
    const feeAmount = inrAmount * tier.rate;
    const totalInr = inrAmount + feeAmount;
    
    updateResults({
        feeRate: tier.rate * 100,
        feeAmount,
        totalAmount: totalInr,
        equivalentAmount: inrAmount,
        currency: 'INR',
        showInrTotal: true
    });
    
    // Update INR input field without triggering event
    inrAmountInput.removeEventListener('input', handleInrInput);
    inrAmountInput.value = inrAmount.toFixed(2);
    inrAmountInput.addEventListener('input', handleInrInput);
}

// Update the UI with calculation results
function updateResults({ feeRate, feeAmount, totalAmount, equivalentAmount }) {
    // Format numbers with proper currency symbols and decimal places
    const formatCurrency = (amount, isInr = true) => {
        return isInr 
            ? `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`
            : `$${amount.toLocaleString('en-US', { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
    };
    
    // Update fee display
    feePercentageSpan.textContent = `${feeRate.toFixed(1)}%`;
    feeAmountSpan.textContent = formatCurrency(feeAmount);
    
    // Update total and equivalent amounts based on mode
    if (isInrToUsd) {
        // In INR to USD mode, show total in INR and equivalent in USD
        totalAmountSpan.textContent = formatCurrency(totalAmount);
        equivalentAmountSpan.textContent = formatCurrency(equivalentAmount, false);
    } else {
        // In USD to INR mode, show total in INR and the original USD amount
        totalAmountSpan.textContent = formatCurrency(totalAmount);
        equivalentAmountSpan.textContent = formatCurrency(equivalentAmount);
    }
}

// Reset all results to default state
function resetResults() {
    feePercentageSpan.textContent = '-';
    feeAmountSpan.textContent = '-';
    totalAmountSpan.textContent = '-';
    equivalentAmountSpan.textContent = '-';
}

// Wrapper functions for event listeners to handle proper scoping
function handleInrInput() { handleInput('inr'); }
function handleUsdInput() { handleInput('usd'); }

// Initialize the calculator when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initCalculator);
