let app = angular.module('ticketHolderApp',['ngResource','ngRoute']);

app.config(function($routeProvider){
    $routeProvider
    .when('/ticketHolder', {
        template:'<build-view></build-view>',
    }).when('/templatemaker', {
        template:'<template-maker></template-maker>',
    })
    .otherwise({
        redirectTo:'/ticketHolder'
    });
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

app.controller('templateMakerCtrl',function($scope ) {
    $scope.selectedTemplate = {
        id: '', //Will be removed later as the db will set this
        name: '',
        items: []
    };
    $scope.item = {
        value:'',
        label:'Place holder',
        type: 'text'
    };
    $scope.inputTypes = ['checkbox','text'];

    $scope.addItem = function () {
        $scope.selectedTemplate.items.push($scope.item);
        $scope.item = {
            value: '',
            label: 'Placeholder',
            type: 'text'
        };
    };
    
    $scope.templates = {}; //TODO: Create service to pull templates from a DB. Maybe use pouchDB?
    
    $scope.createTemplate = function () {  
        
    };
});


app.factory('templateFactory', function() {
    return {
        templateItem: function(value, label, type) {
            this.value = value;
            this.label = label;
            this.type = type;
        },
        template: function(name, items) {
            this.name = name;
            this.items = items;
        }
    };
});
