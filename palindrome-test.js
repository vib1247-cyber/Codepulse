function solve(input) {
    let left = 0;
    let right = input.length - 1;

    while (left < right) {
        // Skip non-alphanumeric characters
        while (left < right && !isAlphaNumeric(input[left])) left++;
        while (left < right && !isAlphaNumeric(input[right])) right--;

        // Compare characters ignoring case
        if (input[left].toLowerCase() !== input[right].toLowerCase()) {
            return false;
        }

        left++;
        right--;
    }

    return true;
}

function isAlphaNumeric(char) {
    return /^[a-z0-9]$/i.test(char);
}

// Test cases
const testCases = [
    { input: "A man, a plan, a canal: Panama", expected: true },
    { input: "race a car", expected: false },
    { input: " ", expected: true },
    { input: "a.", expected: true },
    { input: "0P", expected: false }
];

testCases.forEach((test, index) => {
    const result = solve(test.input);
    console.log(`Test ${index + 1}:`);
    console.log(`Input: "${test.input}"`);
    console.log(`Expected: ${test.expected}`);
    console.log(`Result: ${result}`);
    console.log(`Test ${result === test.expected ? 'PASSED' : 'FAILED'}`);
    console.log('---');
});
