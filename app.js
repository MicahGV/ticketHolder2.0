

let app = angular.module('ticketHolderApp',['ngResource','ngRoute', 'ngMaterial']);

app.config(function($routeProvider, $mdThemingProvider) {
    $routeProvider
    .when('/ticketHolder', {
        template:'<build-view></build-view>',
    }).when('/templatemaker', {
        template:'<template-maker></template-maker>',
    })
    .otherwise({
        redirectTo:'/ticketHolder'
    });

    $mdThemingProvider.theme('default')
        .dark()
        .primaryPalette('blue-grey')
        .accentPalette('deep-orange');
});

app.directive('buildView', function() {
    return {
        restrict:'E',
        templateUrl: '../views/buildview.html',
        controller:'buildCtrl'
    };
});

app.controller('buildCtrl', function($scope, $window, $routeParams) {
    $scope.templateSelection = {};

    $scope.buildTicket = {
        name: {value:'', label:"Requester's Name ",type:'text'},
        ticketnum: {value:'', label:"Ticket Number or Computer Name ",type:'text'},
        hardware: {value:'', label:"Hardware ",type:'text'},
        imaged: {value:'', label:"Imaged Machine ",type:'checkbox'},
        joinDomain: {value:'', label:"Named and Joined to domain ",type:'checkbox'},
        movedOU: {value:'', label:"Moved new computer to proper OU ",type:'checkbox'},
        gpupdate: {value:'', label:"Restarted;ran gpupdate /force ",type:'checkbox'},
        installedSoftware: {value:'', label:"Installed Office 2013, Reader, Flash, Java [if needed] ",type:'checkbox'},
        ltc: {value:'', label:"Deployed LTC Icon via Script (NOT FOR NEW CENTERS) ",type:'checkbox'},
        procurement: {value:'', label:"Created Procurement for Office 2013 and assigned to Shanna ",type:'checkbox'},
        staticIP: {value:'', label:"Set static IP to ",type:'text'},
        gateway: {value:'', label:"Set gateway to ",type:'text'},
        dns: {value:'', label:"set DNS to 192.168.1.15/192.168.1.16 ",type:'checkbox'},
        trackingNum: {value:'', label:"Tracking Number ",type:'text'},
    };
    $scope.allTickets = [];

    $scope.save = function() {
        $scope.allTickets.push($scope.buildTicket);
        let jsonTickets = angular.toJson($scope.allTickets);
        $window.localStorage.setItem('allBuildTickets', jsonTickets);
        $scope.getTickets();
    };

    $scope.reset = function() {
        $scope.ticket = {};
    };

    $scope.getTickets = function() {
        let tickets = angular.fromJson($window.localStorage.getItem('allBuildTickets'));
        $scope.allTickets = tickets || [];
    };

    $scope.checkAll = function() {
        angular.forEach($scope.buildTicket, function(val, key){
            if(typeof(val) === "boolean") {
                $scope.buildTicket[key] = true;
            }
        });
    };

    //Call first
    $scope.getTickets();
    
});

app.directive('ticketView', function() {
    return {
        restrict: 'E',
        templateUrl:'../views/ticket.html',
        controller:'ticketCtrl',
        scope: {
            ticketInfo: '=ticketInfo'
        }
    };
});

app.controller('ticketCtrl', function($scope) {
    
    $scope.getTicketText = function(ticketInfo) {
        let text = '';
        for(let row in ticketInfo) {
            if(ticketInfo[row].label !== undefined)
            text += `\n${ticketInfo[row].label} : ${ticketInfo[row].value}`;
        }
        return text;
    };
    
    $scope.ticketText = $scope.getTicketText($scope.ticketInfo);
});

app.directive('templateMaker', function(){
    return {
        restrict:'E',
        templateUrl:'./views/templateMaker.html',
        controller:'templateMakerCtrl'
    };
});

app.controller('templateMakerCtrl',function($scope, templateFactory) {
    $scope.selectedTemplate = {
        name: '',
        items: []
    };
    $scope.item = {
        value:'',
        label:'Place holder',
        type: 'text'
    };
    $scope.templates = templateFactory.getTemplates(); //TODO: Create service to pull templates from a DB. Maybe use pouchDB?

    $scope.inputTypes = ['checkbox','text'];
    
    $scope.addItem = function () {
        $scope.selectedTemplate.items.push($scope.item);
        $scope.item = new templateFactory.templateItem();
    };

    $scope.moveUp = function(index) {
        console.log(index);
        let items = $scope.selectedTemplate.items;
        let swapIndex = index - 1;
        if(index === 0){
            swapIndex = items.length - 1;
        }
        swapItems(index,swapIndex);
    };
    
    $scope.moveDown = function(index) {
        let items = $scope.selectedTemplate.items;
        let swapIndex = index + 1;
        if(index === items.length -1){
            swapIndex = 0;
        }
        swapItems(index,swapIndex);
    };

    $scope.deleteItem = function(index) {
        if(confirm('Are you sure?') === true) {
            console.log($scope.selectedTemplate.items);
            $scope.selectedTemplate.items.splice(index,1);
        }
    };

    //TODO: Add editing function witin angular material modal
    $scope.editItem = function(index) {
        alert('THIS WILL BE A MODAL');
    };

    function swapItems(index,swapIndex) {
        let items = $scope.selectedTemplate.items;
        let selected = items[index],
            swap = items[swapIndex];
        items[index] = swap;
        items[swapIndex] = selected;
    }
    

    $scope.saveTemplate = function () {  
        templateFactory.addTemplate($scope.selectedTemplate);
    };
    $scope.deleteTemplate = function (id) {
        templateFactory.deleteTemplate(id);
    };
    $scope.updateTemplate = function() {
        templateFactory.updateTemplate($scope.selectedTemplate);
    };

    $scope.newTemplate = function() {
        console.log($scope.templates);
        console.log($scope.selectedTemplate);
    };
    //templateFactory.getTickets().then((data) => {
        //$scope.templates = data;
    //});
});


app.factory('templateFactory', function($resource) {
    let templateResource = $resource('http://localhost:3000/templates/:templateId', {templateId:'@id'}, {'update':{method:'PUT'}});

    return {
        //Models
        templateItem: function(value = " ", label = "Place Holder", type = "text") {
            this.value = value;
            this.label = label;
            this.type = type;
        },
        template: function(name, items) {
            this.name = name;
            this.items = items;
        }, 
        //REST methods
        addTemplate: function(newTemplate) {
            templateResource.save(newTemplate);
        },
        updateTemplate: function(newTemplate) {
            templateResource.update(newTemplate);
        },
        deleteTemplate: function(id) {
            templateResource.delete({templateId:id});
        },
        getTemplates: function() {
            return templateResource.query();
        }

    };
});
