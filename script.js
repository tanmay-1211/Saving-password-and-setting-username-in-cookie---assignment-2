const MIN = 100;
const MAX = 999;
const pinInput = document.getElementById('pin');
const sha256HashView = document.getElementById('sha256-hash');
const resultView = document.getElementById('result');

// a function to store in the local storage
function store(key, value) {
  localStorage.setItem(key, value);
}

// a function to retrieve from the local storage
function retrieve(key) {
  return localStorage.getItem(key);
}

// function to generate a random 3-digit number between MIN and MAX
function getRandomArbitrary(min, max) {
  let cached;
  cached = Math.random() * (max - min) + min;
  cached = Math.floor(cached);
  return cached;
}

// a function to clear the local storage
function clear() {
  localStorage.clear();
}

// function to generate sha256 hash of the given string
async function sha256(message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

// function to get or generate a new SHA256 hash
async function getSHA256Hash() {
  let cached = retrieve('sha256');
  if (cached) {
    return cached;
  }

  const randomNumber = getRandomArbitrary(MIN, MAX);
  const hash = await sha256(randomNumber.toString());
  store('sha256', hash);
  return hash;
}

// main function to initialize the page with the SHA256 hash
async function main() {
  sha256HashView.innerHTML = 'Calculating...';
  const hash = await getSHA256Hash();
  sha256HashView.innerHTML = hash;
}

// function to test the user's guess
async function test() {
  const pin = pinInput.value;

  // check if the input is exactly 3 digits
  if (pin.length !== 3) {
    resultView.innerHTML = '💡 Please enter exactly 3 digits.';
    resultView.classList.remove('hidden');
    resultView.classList.remove('success');
    resultView.classList.add('failure');
    return;
  }

  // hash the input and compare with the original hash
  const hasedPin = await sha256(pin);

  if (hasedPin === sha256HashView.innerHTML) {
    resultView.innerHTML = '🎉 Success! You cracked the hash!';
    resultView.classList.add('success');
    resultView.classList.remove('failure');
  } else {
    resultView.innerHTML = '❌ Incorrect. Try again!';
    resultView.classList.add('failure');
    resultView.classList.remove('success');
  }

  resultView.classList.remove('hidden');
}

// event listener for pin input to ensure it's only 3 digits
pinInput.addEventListener('input', (e) => {
  const { value } = e.target;
  pinInput.value = value.replace(/\D/g, '').slice(0, 3);
});

// attach the test function to the button
document.getElementById('check').addEventListener('click', test);

// initialize the page with the SHA256 hash
main();