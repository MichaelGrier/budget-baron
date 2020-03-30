// BUDGET CONTROLLER
var budgetController = (function() {
    
    // create expense objects
    var Expense = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = -1
    };

    // for each expense object, calculate its percentage of the total income; assign to this.percentage
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) { // if an income exists
            this.percentage = Math.round((this.value / totalIncome) * 100); 
        } else {
            this.percentage = -1;
        } 
    };

    // return the value of this.percentage
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    // create income objects
    var Income = function(id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    };

    // calculate total values for inc and exp
    var calculateTotal = function(type) {
        // initialize value of sum
        var sum = 0;

        // loop through given array (inc or exp) and add values to sum
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        // pass the result into totals object of data structure
        data.totals[type] = sum;

    };

    // store income, expense, budget and percentage data in a structure
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc:0
        },
        budget: 0,
        percentage: -1
    };

    return {
        // add new inc or exp item to data structure
        addItem: function(type, des, val) {
            var newItem, ID;

            // create new ID
            // ID = last ID + 1
                // [1 2 3 4 5], next ID = 6
                // [1 2 4 6 8], next ID = 9
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // push new item into data structure
            data.allItems[type].push(newItem);
            // return the new item
            return newItem;
        },

        // delete item from data structure
        deleteItem: function(type, id) {
            var ids, index;

            // id = 6
            // data.allItems[type][id];
            // ids = [1 2 4 6 8]
            // index = 3

            // loop through inc or exp array, depending on type passed in
            ids = data.allItems[type].map(function(current) {
                // return an array with all of the current ids
                return current.id;
            });

            // access the array index number of the id that was passed in, and store that value
            index = ids.indexOf(id);

            // if the id is not -1 (ie. if the element exists)
            if (index !== -1) {
                // delete the item from the array
                data.allItems[type].splice(index, 1); 
            }
        },
        
        // calculate total budget and add to data structure
        calculateBudget: function() {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1; // if value of inc is 0, percentage = -1
            };
        },

        // calculate what percentage of the total income each expense represents
        calculatePercentages: function() {
            // expense a=20; total income=100; a=20/100=20%

            // loop through the array of expenses
           data.allItems.exp.forEach(function(cur) {
               // apply calcPercentage(totals) to the current index
               cur.calcPercentage(data.totals.inc);
           });
        },

        // return percentages
        getPercentages: function() {
            // loop through the array of expenses; apply getPercentage() to cur; return and store result
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        // return data from data structure
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function() {
            console.log(data);
        }
    };

})();


// UI CONTROLLER
var UIController = (function() {
    
    // store class names of HTML elements
    var DOMstrings = {
        budgetLabel: '.budget__value',
        container: '.container',
        dateLabel:'.budget__title--month',
        expensesContainer: '.expenses__list',
        expensesLabel: '.budget__expenses--value',
        expensesPercLabel: '.item__percentage',
        incomeContainer: '.income__list',
        incomeLabel: '.budget__income--value',
        inputBtn: '.add__btn',
        inputDescription: '.add__description',
        inputType: '.add__type',
        inputValue: '.add__value',
        percentageLabel: '.budget__expenses--percentage'
    };

    var formatNumber = function(num, type) {
        var numSplit, int, dec, type;
        
        // 2310.4563 -> + 2,310.46,
        // 2000 -> + 2,000.00
        
        // calculate the absolute value of the number passed in to two decimal places; store in a variable
        // value is converted to string
        num = Math.abs(num);
        num = num.toFixed(2);

        // split the string into integer and decimal (20.25 = 20 and .25), assign to variables
        numSplit = num.split('.');

        int = numSplit[0];
        // if the length of int is more than 3 digits long, place a comma after every third digit
        if (int.length > 3) {
            int = int.substr(0, int.length -3) + ',' + int.substr(int.length -3, 3);
        }
        dec = numSplit[1];

        // return formatted string with - or + in front
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    // loop through an array, and call nodesListForEach() on each index
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };

    return {
        // read and return field input data
        getInput: function() {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        // return DOMstrings object
        getDOMstrings: function() {
            return DOMstrings;
        },

        // add income or expense item to the UI
        addListItem: function(obj, type) {
            var html, newHtml, element;

            // create and HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },

        // delete income or expense item from the the UI
        deleteListItem: function(selectorID) {
            // select item by its unique ID, target its parent, and remove child
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        // clear input fields
        clearFields: function() {
            var fields, fieldsArr;

            // select input fields and store in a variable
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue)

            // convert fields variable from list to array
            fieldsArr = Array.prototype.slice.call(fields);

            // loop over fields array and set current value to empty
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            });

            // return cursor to description field
            fieldsArr[0].focus();
        },

        // display budget values in the UI
        displayBudget: function(obj) {
            var type;

            // set the value of type for each object passed in
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            // apply formatNumber() and display result in assigned UI elements
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            // if percentage is valid, add % symbol to the end. if not, display  placeholder (---)
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%'; 
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            } 
        },
        
        // display expense percentages in the UI
        displayPercentages: function(percentages) {
            // select all percentage elements and assign them to a variable
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            // check if the text content of the current element is equal to the current index of the array
            nodeListForEach(fields, function(current, index) {
                // if percentage is valid, add % symbol to the end. if not, display ---
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        // display the current month and year in the UI
        displayMonth: function() {
            var now, month, months, year;
            
            // array of month names
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

            // retrieve the month and year, assign to variables
            now = new Date();
            month = now.getMonth();
            year = now.getFullYear();

            // assign formatted text content to UI element
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },

        changedType: function() {

            // assign input fields to an array
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );
            
            // loop through array and toggle the class 'red-focus'
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle('red-focus');
            });

            // toggle class on submit button
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

        }
    };

})();


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

    var setupEventListeners = function() {
        // get DOMstrings object from UI controller
        var DOM = UICtrl.getDOMstrings();

        // add inc or exp item
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        // delete inc or exp item
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        // change input field color
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }

    // calculate and update total budget
    var updateBudget = function() {
        // 1. calculate the budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        var budget = budgetCtrl.getBudget();
        // 3. display the budget in the UI
        UICtrl.displayBudget(budget);
    }

    // calculate and update percentages
    var updatePercentages = function() {
        // 1. calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        // 3. update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    }

    // add budget item to user interface
    var ctrlAddItem = function() {
        var input, newItem;

        // 1. get the field input data
        input = UICtrl.getInput();

        // 2. confirm that field input data is valid
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 3. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 4. add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 5. clear input fields
            UICtrl.clearFields();
            // 6. calculate and update budget
            updateBudget();
            // 7. calculate and update percentages
            updatePercentages();
        };
    }

    // delete budget item from user interface
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        // target delete button's parent element by ID (ex. inc-0) and assign to variable
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        // if the ID is defined
        if (itemID) {
            // split that ID into seperate values (ex. 'inc' and 0) and assign to variables
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the element's corresponding item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. update and show the new budget
            updateBudget();
            // 4. calculate and update percentages
            updatePercentages();
        }
    }

    // initialization function
    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();

        }
    };

})(budgetController, UIController);

// initialize app
controller.init();