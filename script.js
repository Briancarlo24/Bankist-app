'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2021-10-17T14:11:59.604Z',
    '2021-10-20T17:01:17.194Z',
    '2021-10-24T23:36:17.929Z',
    '2021-10-24T01:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2021-10-10T14:43:26.374Z',
    '2021-10-25T18:49:59.371Z',
    '2021-10-24T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////////////////////////////////////////
/**************************FUNCTIONS**************************/
// const formatCurrency = function (currency) {};

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24))); // Calculate the time between 2 dates

  const daysPassed = calcDaysPassed(new Date(), date);
  if (daysPassed === 0) return `today`;
  else if (daysPassed === 1) return `yesterday`;
  else if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    const day = `${date.getDate()}`.padStart(2, 0);
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const year = date.getFullYear();
    // return `${month}/${day}/${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};
//Format Currency
const formatCurrency = function (acc, currency) {
  const formattedMov = new Intl.NumberFormat(acc.locale, {
    style: 'currency',
    currency: acc.currency,
  }).format(currency);
  return formattedMov;
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  //Sorting Descending Order
  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, index) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[index]);
    const displayDate = formatMovementDate(date, acc.locale);
    const formattedMov = formatCurrency(acc, mov);

    const html = `
    <div class="movements__row"> 
      <div class="movements__type movements__type--${type}">${index + 1} ${type}
      </div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value"> ${formattedMov}</div>

    </div>
    `;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (account) {
  account.balance = account.movements.reduce((acc, cur) => (acc += cur), 0);

  const formattedMov = formatCurrency(account, account.balance);
  labelBalance.textContent = `${formattedMov}`;
};

const calcDisplaySummary = function (account) {
  const incomes = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCurrency(account, incomes);

  const out = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCurrency(account, Math.abs(out));

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * account.interestRate) / 100)
    .filter(int => int >= 1) // only add the interest that is greater than 1
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = formatCurrency(account, interest);
};

//--Returns the initial of the full name of the owner
//Creates a username for the user using the initials of their name
const createUserName = function (accs) {
  accs.forEach(acc => {
    acc.username = acc.owner //create a new object for account called 'username'
      .toLowerCase()
      .split(' ')
      .map(name => name.slice(0, 1))
      .join('');
  });
};
createUserName(accounts);

const updateUI = function (acc) {
  //Display Movements
  displayMovements(acc);
  //Dispaly Balance
  calcDisplayBalance(acc);
  //Display Summary
  calcDisplaySummary(acc);
};

const startLogoutTimer = function () {
  const tick = () => {
    const min = `${Math.trunc(time / 60)}`.padStart(2, 0);
    const sec = `${time % 60}`.padStart(2, 0);
    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = `Log in to get started`;
      containerApp.style.opacity = 0;
    }
    //Decrease 1 second
    time--;
    // When 0 seconds, stop timer and log out user
  };
  // Set time to 5 minutes
  let time = 300;
  console.log(time);
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

////////////////////////////////////////////
//Event Handlers
let currentAccount, timer;

//FAKE ALWAYS LOGGED IN (DELETE LATER)------------------------------------
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;
//FAKE ALWAYS LOGGED IN END (DELETE LATER)------------------------------------

btnLogin.addEventListener('click', function (e) {
  e.preventDefault(); // Prevent form from submitting
  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // ? = is to check if the account exists
  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and a Welcome Message
    labelWelcome.textContent = `Welcome back ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;
    /* //Create current Time and Date
    const dateNow = new Date();
    const day = `${dateNow.getDate()}`.padStart(2, 0);
    const month = `${dateNow.getMonth() + 1}`.padStart(2, 0);
    const year = dateNow.getFullYear();
    const hour = dateNow.getHours();
    const min = `${dateNow.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = `${month}/${day}/${year}, ${hour}:${min}`;
    */
    // Experimenting API
    const dateNow = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', //long
      year: 'numeric',
      // weekday: 'long',
    };
    // const locale = navigator.language;
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(dateNow);

    //Clear input fields
    inputLoginUsername.value = '';
    inputLoginPin.value = '';
    inputLoginPin.blur();
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();

    updateUI(currentAccount);
  }
});

//Transfer money
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  // Transfer to
  const amount = +inputTransferAmount.value;
  const receiverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = '';
  inputTransferTo.value = '';

  if (
    amount <= currentAccount.balance &&
    amount > 0 &&
    receiverAccount?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    // Add date now
    const dateNow = new Date();
    currentAccount.movementsDates.push(dateNow.toISOString());
    receiverAccount.movementsDates.push(dateNow.toISOString());
    // Update UI
    updateUI(currentAccount);
    //Reset Timer
    clearInterval(timer);
    timer = startLogoutTimer();
  } else {
    alert(`Transfer Not Valid!`);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);
      // Add date now
      const dateNow = new Date();
      currentAccount.movementsDates.push(dateNow.toISOString());
      //Update UI
      updateUI(currentAccount);
      //Reset Timer
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 2500);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  const user = inputCloseUsername.value;
  const pin = +inputClosePin.value;
  if (currentAccount.username === user && currentAccount.pin === pin) {
    console.log('Account Successfully Deleted!');
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    //Delete account
    accounts.splice(index, 1);
    //Hide UI
    containerApp.style.opacity = 0;
  } else {
    console.log('Wrong Credetials');
  }
  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

// Change the color of Movements every 2 row
window.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    if (i % 2 === 0) {
      row.style.backgroundColor = 'rgba(238, 238, 238, 0.25)';
    }
  });
});
