//Accounting Spreadsheet - Todo-Like App ft D3
//@author bfisher
 
 
 //Add the localstoragemodule as a dependency so it's available in the module 

 var myApp = angular.module('myApp', ['LocalStorageModule']); 
 
 //Controller Portion      
  
  myApp.controller('ItemCtrl', [
        '$scope', 
        'localStorageService', //this adds the localStorageService as a dependency so it is available within ItemCtrl
        function($scope, localStorageService){
     
        if (!localStorageService.get('items')) {
    //Set data Model if not found in localstorage
    $scope.items = [
    {note:'Groceries', expense:345.56, income: 0, date: '01/15/2012'},
    {note:'Rent', expense:0,income:12.41, date: '01/15/2012'},
    {note:'Credit Card', expense:21.19, income: 0, date: '01/18/2012'},
    {note:'Student Loan', expense:1.04, income: 0, date:'01/19/2012'},
    {note:'Laptop', expense: 0, income:43.13, date:'01/24/2012'},
    {note:'Foo', expense: 0, income: 34.43, date:'01/24/2012'},
    {note:'Bar', expense: 0, income: 588.91,date:'01/24/2012'},
    {note:'Baz', expense: 593.0,  income:0, date:'01/26/2012'},
    {note:'Hello', expense: 345.56, income:0, date:'01/27/2012'},
    {note:'World', expense: 0, income: 12.12, date:'01/29/2012'},
    {note:"I'm Broke", expense: 21.19, income: 0, date:'01/30/2012'}]
    localStorageService.add('items',JSON.stringify($scope.items));
    } else {
    $scope.items = JSON.parse(localStorageService.get('items'));
    }     
        
    data = $scope.items;
    
       
    
   
    //Controller - Add Items to Data Model with sanitization checks     
    $scope.addItem = function() {
     
    if ($scope.addIncome){
    if (/[a-zA-Z\$]/g.test($scope.addIncome)) {
    alert('Income must be numerics only');
    return false;
    }
    
    if (angular.isNumber(parseFloat($scope.addIncome))) {
    setIncome = parseFloat($scope.addIncome); 
    }
    else {
    alert('Income must be numerics only.');
    return false;
    }
    } else {
    setIncome = 0;
    }
    
    if ($scope.addExpense){
      if (/[a-zA-Z\$]/.test($scope.addExpense)) {
        alert('Expense must be numerics only');
        return false;
      }
        if (angular.isNumber(parseFloat($scope.addExpense))) {
        setExpenseNote = parseFloat($scope.addExpense); 
      }
      else {
        alert('Expenses must be numerics only.');
        return false;
        }
      } else {
        setExpenseNote = 0;
    }
    
    var thedate = /^((0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)?[0-9]{2})/;
    if (thedate.test($('#datepicker').val()) == false) {
    alert('Date must be in format mm/yy/dddd')
    return false;
    }
    
    $scope.items.push({note:$scope.addNote,expense: setExpenseNote,income:setIncome,date:$('#datepicker').val()});
    localStorageService.remove('items')
    localStorageService.add('items',JSON.stringify($scope.items))
   
    };
     
     
    //Controller - remove an item from the data model array 
    $scope.removeItem = function(index) {
    $scope.items.splice(index, 1);   
    
    localStorageService.remove('items')
    localStorageService.add('items',JSON.stringify($scope.items)) 
    };
   
   
   //Controller - continuously calculate balance on add/subtraction from list
    $scope.balance = function() {
    var balance = 0;
    
    
    angular.forEach($scope.items, function(item) {
   
    newIncome = parseFloat(item.income);
    newExpense = parseFloat(item.expense);
    
    balance = balance + (newIncome - newExpense);
    
    });
 
    num = balance.toString();
    
    if (num.indexOf(".") !== -1) {
    num = num.slice(0,(num.indexOf(".")) + 3);
    }
  
       
    if (balance < 0) {
    return '-$' +  num.replace('-','');    
    }
    else {
    return '$' + num;
    }
    };
        }     
      ]); 
      
      
      //**Datavisualization Directive**
      
      myApp.directive('datavisualization', function () {
    // constants
    var w = 1000, h = 200, margin = 20, color = d3.interpolateRgb("#f77", "#77f");

    return {
        restrict : 'E',
        scope : {
            val : '=',
            grouped : '='
        },
        link : function(scope, element, attrs) {
            var date_sort_asc = function (date1, date2) {
              if (date1.date2 > date2.date2) return 1;
              if (date1.date2 < date2.date2) return -1;
              return 0;
            };
            var m = [80, 80, 80, 80], w = 960 - m[1] - m[3], h = 500 - m[0] - m[2], parse = d3.time.format("%a %d").parse;
            scope.$watch('val', function(newVal, oldVal) {
                angular.element(element).html("");
                var values = newVal;
                for(i in values){
                    values[i].date2 = new Date(values[i].date);
                }
                values.sort(date_sort_asc);
                console.log(values);
                // Scales and axes. Note the inverted domain for the y-scale.
                var x = d3.time.scale().range([0, w]), y = d3.scale.linear().range([h, 0]), xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true), yAxis = d3.svg.axis().scale(y).ticks(15).orient("right");

                // An area generator, for the light fill.
                var area = d3.svg.area().interpolate("monotone").x(function(d) {
                    return x(d.date2);
                }).y0(h).y1(function(d) {
                    return y(d.expense);
                });

                // A line generator, for the dark stroke.
                var line = d3.svg.line().interpolate("monotone").x(function(d) {
                    return x(d.date2);
                }).y(function(d) {
                    return y(d.expense);
                });
                var line2 = d3.svg.line().interpolate("monotone").x(function(d) {
                    return x(d.date2);
                }).y(function(d) {
                    return y(d.income);
                });
                

                // Parse dates and numbers. Values are sorted by date.
                values.forEach(function(d) {
                    d.date2 = d.date2;
                    d.expense = +d.expense;
                });
                
                // Compute the minimum and maximum date, and the maximum income + expense.
                x.domain([values[0].date2, values[values.length - 1].date2]);
                y.domain([0, d3.max(values, function(d) {
                    return d.income + d.expense;
                })]).range();

                // Add an SVG element with the desired dimensions and margin.
                var svg = d3.select(element[0]).append("svg:svg").attr("width", w + m[1] + m[3]).attr("height", h + m[0] + m[2]).append("svg:g").attr("transform", "translate(" + m[3] + "," + m[0] + ")");

                // Add the clip path.
                svg.append("svg:clipPath").attr("id", "clip").append("svg:rect").attr("width", w).attr("height", h);

                // Add the area path.
                svg.append("svg:path").attr("class", "area").attr("clip-path", "url(#clip)").attr("d", area(values));

                // Add the x-axis.
                svg.append("svg:g").attr("class", "x axis").attr("transform", "translate(0," + h + ")").call(xAxis);

                // Add the y-axis.
                svg.append("svg:g").attr("class", "y axis").attr("transform", "translate(" + w + ",0)").call(yAxis);

                // Add the line path.
                svg.append("svg:path").attr("class", "line").attr("clip-path", "url(#clip)").attr("d", line(values));
                svg.append("svg:path").attr("class", "line2").attr("clip-path", "url(#clip)").attr("d", line2(values));
                // Add a small label for the symbol name.
                svg.append("svg:text").attr("x", w + 15).attr("y", h + 50).attr("text-anchor", "end").attr("class", "income").text("Income");
                svg.append("svg:text").attr("x", w + 20).attr("y", h + 30).attr("text-anchor", "end").attr("class", "expense").text("Expense");
               
                
            },true);

        }
    }  })   