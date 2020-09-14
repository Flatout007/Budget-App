// UI
const UIModule = (function() {     
    let HTMLSelectors = {
         type: ".add__type",
         description: ".add__description",
         value: ".add__value",
         addButton: ".add__btn",
         expensesDiv: ".expenses__list",
         incomeDiv: ".income__list",
         budgetDivText: ".budget__value",
         budgetIncomeDivText: ".budget__income--value",
         budgetPercentageDivText: ".budget__expenses--percentage",
         budgetExpensesDivText:".budget__expenses--value",
         container: ".container",
         insertedPercentage: ".item__percentage",
         dateDivText: ".budget__title--month"
    }; 
    let formatBudgetNumber = function(n, type) {
         let num, number, splitnum, integer, decimal;

         num = Math.abs(n);

         number = num.toFixed(2);
       
         splitnum = number.split('.');
         integer = splitnum[0];
         decimal = splitnum[1];

         if(integer.length>3) {
             integer = integer.substr(0,  integer.length-3) + ',' + integer.substr(integer.length-3, 3);
         }

         if(type === "expenses") {
             return `- ${integer}.${decimal}`;
         } else if (type === "income") {
             return `+ ${integer}.${decimal}`;
         }
    };
     // my custom forEach function from scratch.
     let forEachInArray = function(list, callback) {
         for(let i=0; i<list.length; i++) {
             callback(list[i], i);
         }
     };
    return {
     getInputValues: function() {
         return {
             type: document.querySelector(HTMLSelectors.type).value,
             description: document.querySelector(HTMLSelectors.description).value,
             value: parseFloat(document.querySelector(HTMLSelectors.value).value)
            } 
    },
     retrieveHtmlSelectors: function() {
         return HTMLSelectors;
    },
     addToUI: function(constructor, type, obj) {
         let html, newhtml, budgetSelector;

         // insert HTML with placeholder values based on type.
         if(type === "income") {
             budgetSelector = HTMLSelectors.incomeDiv;

             html = `<div class="item clearfix" id="income-%id">
             <div class="item__description">%des</div> <div class="right clearfix">
             <div class="item__value">%val</div> <div class="item__delete">
              <button class="item__delete--btn"> <i class="ion-ios-close-outline"></i></button></div></div> 
            </div>`;                       
         } else if(type === "expenses") {
             budgetSelector = HTMLSelectors.expensesDiv;

             html = `<div class="item clearfix" id="expenses-%id">
             <div class="item__description">%des</div> <div class="right clearfix">
             <div class="item__value">%val</div> <div class="item__percentage">100%</div>
             <div class="item__delete">
             <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div>
              </div>
             </div>`;
         }

         // replace placeholders with constructor and percentage properties.
         newhtml = html.replace('%id', constructor.id);
         newhtml = newhtml.replace('%des',constructor.description);
         newhtml = newhtml.replace('%val', formatBudgetNumber(constructor.value, type));

         // insert into DOM
         document.querySelector(budgetSelector).insertAdjacentHTML("beforeend", newhtml);
     },
      clearInputText: function() {
         let nodeList, slicedNodeList;

         nodeList = document.querySelectorAll([HTMLSelectors.description,HTMLSelectors.value]);
         slicedNodeList = [].slice.call(nodeList);
         
         // clear input fields by assigning each property value to empty strings.
         slicedNodeList.forEach(function(element, index, array) {
             element.value = "";
             array[0].focus();
            });       
     },
      displayBudgetInUI: function(budgetObject) {
         document.querySelector(HTMLSelectors.budgetDivText).textContent = budgetObject.budget;
         document.querySelector(HTMLSelectors.budgetExpensesDivText).textContent = budgetObject.expenses;
         document.querySelector(HTMLSelectors.budgetIncomeDivText).textContent = budgetObject.income;

         if(budgetObject.percentage > 0) {
             document.querySelector(HTMLSelectors.budgetPercentageDivText).textContent = budgetObject.percentage + "%";
         } else if(!(budgetObject.percentage > 0)) {
             document.querySelector(HTMLSelectors.budgetPercentageDivText).textContent = "N/A";
         }  
     },
      displayCurrentDate: function() {
         let monthArr, date, monthNumber, year;

         monthArr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

         date = new Date();
         monthNumber = date.getMonth();
         year = date.getFullYear();

         document.querySelector(HTMLSelectors.dateDivText).textContent = `${monthArr[monthNumber]} ${year}`;
     },   
     // Remove individual budget tags from user interface.
     deleteFromDOM: function(id) {
         let selectorid = document.getElementById(id);
        
         document.getElementById(id).parentNode.removeChild(selectorid);
     },
     displayExpensePercentage: function(percentage) {
         let percentList = document.querySelectorAll(HTMLSelectors.insertedPercentage);
            
         // individual budget tab percentages.
         forEachInArray(percentList,function(element, index) {
              element.textContent = percentage[index] + "%";  
            });       
     },
     changeInputColor: function() {
         let inputFields = document.querySelectorAll([HTMLSelectors.type, HTMLSelectors.description, 
            HTMLSelectors.value, HTMLSelectors.addButton]);

         inputFields[0].classList.toggle("red");

         inputFields[inputFields.length-1].classList.toggle("red");

         forEachInArray(inputFields, function(element, index, array) {
             element.classList.toggle("red-focus");
            });    
     }
    }
})();
// DATA
const DataModule = (function() {
    // +Expenses constructor
    let BudgetExpenses = function(id, description, value) {
         this.id = id;
         this.description = description;
         this.value = value;
         this.percentage = -1;
    }; 
      BudgetExpenses.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0)  { 
             this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
             this.percentage = "N/A";
        }
      }
      BudgetExpenses.prototype.retrievePercentageProperties = function() {
         return this.percentage;
      }
    // +Income constructor
    let BudgetIncome = function(id, description, value) {
         this.id = id;
         this.description = description;
         this.value = value;
    }; 
    let sumTotalBudget = function(type) {
         let sum = 0;
        
         data.budgetInfo[type].forEach(function(element, index, array) {
             sum += element.value;           
           });

        data.totalAmount[type] = sum;
    };
    // aggregate for budget data. 
    let data = {
         budgetInfo: {
             income: [],
             expenses: []
            },
         totalAmount: {
             income: 0,
             expenses: 0    
            },
         budget: 0,
         percentage: -1,
         incomeAmount: 0,
         expenseAmount: 0    
    };
    return {
         collectBudgetData: function(type, description, value) {
             let ID, budgetInstance;
             
              // checks budgetInfo arrays for content to then
             //  set a unique id # for each item in both arrays.
             if(data.budgetInfo[type].length > 0) {
                 ID = data.budgetInfo[type] [data.budgetInfo[type].length - 1].id + 1;
             } else {
                 ID = 0;
             }

             // checks which instance will be created based on budget type.
             if(type === "expenses") {
                 budgetInstance = new BudgetExpenses(ID, description, value);
             } else if(type === "income") {
                 budgetInstance = new BudgetIncome(ID, description, value); 
             }

             data.budgetInfo[type].push(budgetInstance);

             return budgetInstance;  
        },
         updateCalculations: function() { 
             sumTotalBudget("expenses");
             sumTotalBudget("income");

             data.budget = data.totalAmount.income - data.totalAmount.expenses;

             if(data.totalAmount.income > 0) {
                 data.percentage = Math.round((data.totalAmount.expenses / data.totalAmount.income) * 100);
             } else if (!(data.totalAmount.income > 0)) {
                 return -1;
             }
             
             data.incomeAmount = data.totalAmount.income;
             data.expenseAmount = data.totalAmount.expenses;
        },
         removeFromBudget: function(type, id) {
             let idarr, indices; 

             idarr = data.budgetInfo[type].map(function(element, index, array) {
                 return element.id
                });

             indices = idarr.indexOf(id);

             if(indices !== -1) {
                 data.budgetInfo[type].splice(indices, 1);
             } 
        },    
         retrieveBudgetProperties: function() {
            return {
                 budget: data.budget,
                 percentage: data.percentage,
                 income: data.incomeAmount,
                 expenses: data.expenseAmount
            }
        },
         expensePercentage() {
             data.budgetInfo.expenses.forEach(function(element, index, array) {
                 element.calcPercentage(data.totalAmount.income);
               });  
         },
         storePercentArray() {
            let percentarr = data.budgetInfo.expenses.map(function(element, index, array){
                 return element.retrievePercentageProperties();
               });
            return percentarr;
         }
      }    
})();
// EVENT CONTROLLER
const ControllerModule = (function(UI, Data) {
    // HTML selectors from UI module to use for events.
    let DOMStrings = UI.retrieveHtmlSelectors();
    
    let budgetUICalculations = function() {
         let budgetProps;

         // all budget calculations.
         Data.updateCalculations();
         
         budgetProps = Data.retrieveBudgetProperties();

         //  display calculations in user interface.
         UI.displayBudgetInUI(budgetProps);
    };
    let updateExpensePercentage = function() {
         let percents;

         Data.expensePercentage();

         percents = Data.storePercentArray();

         UI.displayExpensePercentage(percents);
    };
    let deleteItems = function(e) {
         let item, splitstr, type, id;

         // delagate event to proper parent node.
         item = e.target.parentNode.parentNode.parentNode.parentNode.id;
          
         if(item) {
             splitstr = item.split("-");
             type = splitstr[0];
             id = parseInt(splitstr[1]);

             Data.removeFromBudget(type, id);

             UI.deleteFromDOM(item);  
         }
    
         // recalculates budget after deletion occurs.
         budgetUICalculations();

         updateExpensePercentage();
    }
    // update DOM with correct budget via user events.
    let setEvents = function() {   
         // via return key
         document.addEventListener("keypress",function(e) {
             if(e.which === 13 || e.keyCode === 13) {
                 UpdateItems();
             }
           });
         // via html button
         document.querySelector(DOMStrings.addButton).addEventListener("click", UpdateItems)
         
         // via delagated html button
         document.querySelector(DOMStrings.container).addEventListener("click", deleteItems);
         
         // via toggle
         document.querySelector(DOMStrings.type).addEventListener("change", UI.changeInputColor);
    };
    // updates DOM items with content. ONLY USE THIS FOR EVENTS!
    let UpdateItems = function() {
         let inputValues, budgetData, html;

         inputValues = UI.getInputValues();
        
         // check input field for valid input.
         if(inputValues.description !== "" && inputValues.value !== 0 && !isNaN(inputValues.value)) {  
             
             budgetData = Data.collectBudgetData(inputValues.type, inputValues.description, 
                 inputValues.value);
              
             budgetProps = Data.retrieveBudgetProperties();

             // display constructor properties and percentage to UI.
             html = UI.addToUI(budgetData, inputValues.type, budgetProps);

             // clear values from input form fields.
             clear = UI.clearInputText();

             // display budget claculations to UI.
             budgetUICalculations();

             updateExpensePercentage();
        }
    }; 
    // Initilization for Procedures.
    return {
        initialize: function() {
             // display date in user interface.
             UI.displayCurrentDate();

             //  Default user interface values for budget.
             UI.displayBudgetInUI(
               { budget: 0,
                 percentage: -1, 
                 income: 0,
                 expenses: 0
               }
             );

             setEvents();            
        }
    }
})(UIModule, DataModule);

// Initilization Procedure Caller.
ControllerModule.initialize();