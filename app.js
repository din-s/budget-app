//Budget Controller 
const budgetController = (function(){
    class Expense{
        constructor(id,description,value){
            this.id=id,
            this.description = description,
            this.value=value,
            this.percentage = undefined
        }
        
        calcPercentage(totalIncome){
            if(totalIncome){
                this.percentage = Math.round(this.value / totalIncome *100)
            }
        }

        getPercentages(){
            return this.percentage
        }
    }

    class Income{
        constructor(id,description,value){
            this.id=id,
            this.description = description,
            this.value=value
        }
    }

    data={
        allItems:{
            inc:[],
            exp:[]
        },
        totals:{
            inc:0,
            exp:0,
            percentage: -1
        }
    }

    calculateTotalIncome=(callback)=>{
        const incomes =data.allItems['inc'].map((income)=>Number (income.value))
        return incomes.reduce(callback, 0)
        }
    calculateTotalExpense=(callback)=>{
            const expenses = data.allItems['exp'].map((expense)=>Number(expense.value))
        return expenses.reduce(callback,0)
            }

    return {
        addItem : ({type,description,value})=>{
            const id = uuidv4()
            let newItem;
            if ( type === 'exp'){
            newItem = new Expense(id,description,value)
            }else{
            newItem = new Income(id,description,value)
            }

            // console.log(type,'type')
            data.allItems[type].push(newItem)

            return newItem
        },
        deleteItem:(type,id)=>{
            
            const newData = data.allItems[type].filter((item)=>item.id !== id)
            data.allItems[type] = newData
            console.log('removed')
        },
        getData:()=>{
           return data.totals
        },
        calculateBudget:()=>{   
            const reducer = (sum,curr)=>sum+curr
            data.totals['inc']=calculateTotalIncome(reducer)
            data.totals['exp']=calculateTotalExpense(reducer)
            data.totals['percentage']=data.totals['inc'] >0?Math.round(data.totals['exp']/data.totals['inc'] *100):'---'
        },
        calculatePercentages:()=>{
            const expenses = data.allItems.exp
            const inc = data.totals.inc
            const allPerc = expenses.map((expense)=>{
                expense.calcPercentage(inc)
                return expense.getPercentages()
            })
            return allPerc
        }
    }

})()


// UI Controller 
const UIController = (function(){

    const DOMClasses ={
        inputType:'.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn: '.add__btn',
        incomeList:'.income__list',
        expenseList:'.expenses__list',
        totalIncome:'.budget__income--value',
        totalExpense:'.budget__expenses--value',
        budget:'.budget__value',
        percentage:'.budget__expenses--percentage',
        expenseItemPercentage:'.item__percentage',
        container:'.container',
    }

    const DOMComponents ={
        add_btn: document.querySelector(DOMClasses.inputBtn),
        inputType:document.querySelector(DOMClasses.inputType),
        inputDescription:document.querySelector(DOMClasses.inputDescription),
        inputValue:document.querySelector(DOMClasses.inputValue),
        incomeList:document.querySelector(DOMClasses.incomeList),
        expenseList:document.querySelector(DOMClasses.expenseList),
        totalIncome:document.querySelector(DOMClasses.totalIncome),
        totalExpense:document.querySelector(DOMClasses.totalExpense),
        budget:document.querySelector(DOMClasses.budget),
        percentage:document.querySelector(DOMClasses.percentage),
        container:document.querySelector(DOMClasses.container),
        expenseItemPercentage:document.querySelectorAll(DOMClasses.expenseItemPercentage)
    }
    
    return {
        getInput:()=>({
            type:DOMComponents.inputType.value, // 'inc' or 'exp', Default='inc'
            description:DOMComponents.inputDescription.value, // TextString
            value:DOMComponents.inputValue.value // number 
        }),
        getDOMComponents:DOMComponents,
        renderToDOM:({id, description, value},type)=>{
            let html,DOMElement,newHtml;
    
            if(type === 'exp'){
                DOMElement = DOMComponents.expenseList
                html = '<div class="item clearfix" id="exp-$id"><div class="item__description">$description</div><div class="right clearfix"><div class="item__value">$value</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if ( type==='inc' ){
                DOMElement= DOMComponents.incomeList
                html = '<div class="item clearfix" id="inc-$id"><div class="item__description">$description</div><div class="right clearfix"><div class="item__value">$value</div><divclass="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
    
            newHtml =html.replace('$id', id)
            newHtml = newHtml.replace('$description', description)
            newHtml = newHtml.replace('$value', `₹ ${value}`)            
            DOMElement.insertAdjacentHTML('beforeend',newHtml)
        },    
        clearInputField:()=>{
            DOMComponents.inputDescription.value='' // TextString
            DOMComponents.inputValue.value= ''// number 
            DOMComponents.inputDescription.focus()
        },
        updateBudget:(total)=>{
            DOMComponents.budget.textContent = '₹ '+(total.inc - total.exp)
            DOMComponents.totalIncome.textContent = '₹ '+total.inc
            DOMComponents.totalExpense.textContent = '₹ '+ total.exp
            DOMComponents.percentage.textContent = total.percentage+'%'
        },
        deleteListItem:(elementId)=>{
            const thisElement = document.getElementById(elementId)

            thisElement.parentNode.removeChild(thisElement)
        },
        displayExpensePercent:(percentages)=>{

            const parentEl = DOMComponents.expenseList
            const arr = Array.from(parentEl.childNodes)
            arr.forEach((element,index)=>element.childNodes[1].childNodes[1].textContent = `${percentages[index]}%`)
                // console.log(arr[0].childNodes[1].childNodes[1])
                // parentEl.prototype.forEach((el)=>console.log(el))
            // nodeListForEach(parentEl, (currentEl, index) =>{
                
            //     if (percentages[index] > 0) {
            //         currentEl.textContent = percentages[index] + '%';
            //     } else {
            //         currentEl.textContent = '---';
            //     }
            // })
        },
        displayMonth:()=>{
            const now = new Date()
            const month = now.getMonth()
            const year = now.getFullYear()

            const months=['Jan', 'Feb', 'Mar','Apr','May','June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
            document.querySelector('.budget__title--month').textContent = `${months[month]}-${year}`
        },
        changedInputType:()=>{
            const nodeList = (document.querySelectorAll(`${DOMClasses.inputType}, ${DOMClasses.inputValue},${DOMClasses.inputDescription}`))
            const arr = Array.from(nodeList)
            nodeList.forEach((e)=>e.classList.toggle('red-focus'))

            DOMComponents.add_btn.classList.toggle('red')
            // for(let i =0 ; i < arr.length-1;i++){
            //     arr.classList.add('red-focus')
            // }
            // arr[3].classList.add('red')
        }
    }   

})()

// AppController

const controller =(function(appCtrl, UICtrl){

    const setUpEventHadlers = ()=>{
        const DOMComponents = UICtrl.getDOMComponents
        DOMComponents.add_btn.addEventListener('click',ctrlAddItem)
        DOMComponents.container.addEventListener('click',ctrlDeleteItem)

        document.addEventListener('keypress',(e)=>{
    
            if(e.keyCode === 13){
                ctrlAddItem()
            }
        })

        DOMComponents.inputType.addEventListener('change',UICtrl.changedInputType)
        
    }


    const ctrlAddItem = ()=>{

        //1. Get Input from Ui
        const input = UIController.getInput()

        //2.Adding new Item to dataStructure
        if(input.type === undefined || input.description == false || input.value == false){
            console.log('Please provide valid input')
            alert('Plese enter valid entry in all fields')
        }else{
        const newItem = appCtrl.addItem({ ...input })
            
        //3.Add newItem to UI
        UICtrl.renderToDOM({ ...newItem }, input.type)

        //4. Update / Calculate Budget 
        UICtrl.clearInputField()

        appCtrl.calculateBudget()
        
        //5.Update UI
        const obj = appCtrl.getData()
        UICtrl.updateBudget(obj)
        getPercentages()
        
        }
  
       
    }

    const ctrlDeleteItem = (e)=>{

        const stringId = e.target.parentNode.parentNode.parentNode.parentNode.id
        const [type, ...rest]= stringId.split('-')
        const id = rest.join('-')

        if(stringId){
        //1.Delete Item from datastructure
            appCtrl.deleteItem(type,id)
            //2.Remove from UI
            UICtrl.deleteListItem(stringId)
            appCtrl.calculateBudget()
            //3.Update budget
            const obj = appCtrl.getData()
            UICtrl.updateBudget(obj)
        }
        
        getPercentages()

    }

    const getPercentages =()=>{

        //1.Calculate and get percentages
        const percentages = appCtrl.calculatePercentages() 
        //2.Disply to UI
        UICtrl.displayExpensePercent(percentages)
    }

    return {
        init:()=>{
            console.log('App has Started!')
            setUpEventHadlers()
            UICtrl.updateBudget({inc:0,exp:0,percentage:'---'})
            UICtrl.displayMonth()
        }
    }    

})(budgetController, UIController)

controller.init()