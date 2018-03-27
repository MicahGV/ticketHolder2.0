//TODO:MODULARIZE PRETTY MUCH EVERYTHING IN HERE

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

app.controller('buildCtrl', function($scope, $window, $routeParams, templateFactory, ticketFactory) {
    $scope.templates = templateFactory.getTemplates().then((doc) => {
        $scope.templates = doc.rows;
    });
    
    $scope.selectedTemplate = {};

    $scope.allTickets = ticketFactory.getAllTickets() || [];


    $scope.save = function() {
        ticketFactory.save($scope.selectedTemplate);
    };

    $scope.reset = function () {
        for(let row in $scope.selectedTemplate.items) {
            $scope.selectedTemplate.items[row].value = '';
        }
    };

    $scope.checkAll = function () {  
        for(let row in $scope.selectedTemplate.items) {
            let item = $scope.selectedTemplate.items[row];
            if(item.type === 'checkbox'){
                item.value = true;
            }
        }
    };
    
});

app.directive('ticketView', function() {
    return {
        restrict: 'E',
        templateUrl:'../views/ticket.html',
        controller:'ticketCtrl',
        scope: {
            ticketInfo: '=ticketInfo',
            ticketIndex: '='
        }
    };
});

app.controller('ticketCtrl', function($scope, $mdDialog, ticketFactory) {
    //This probably a really dumb way to do this
    //Getting the name of the computer
    //This will break on anything, but generic template
    $scope.ticketTitle = $scope.ticketInfo[1].value || 'No Template Name';
    

    $scope.getTicketText = function(ticketInfo) {
        let text = '';
        for(let row in ticketInfo) {
            if(ticketInfo[row].label !== undefined) {
                if(ticketInfo[row].type === 'checkbox') {
                    text += `\n${ticketInfo[row].label.trim()}: ${ticketInfo[row].value ? 'Complete' : 'N/A'}`;
                } else 
                    text += `\n${ticketInfo[row].label.trim()}: ${ticketInfo[row].value}`;
            }
        }
        return text;
    };

    $scope.ticketText = $scope.getTicketText($scope.ticketInfo);

    $scope.editTicket = function(ticket){
        $mdDialog.show({
            controller: $scope => $scope.ticket = ticket,
            templateUrl: './views/ticketDialog.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose: true,
            locals: {
                ticket: $scope.ticketInfo
            }
        }).then(() => {
            //Maybe make a toast or something that said it was edited
            console.log('eh');
        }, () => {
            //
            ticketFactory.editTicket($scope.ticketInfo);
            $scope.ticketText = $scope.getTicketText($scope.ticketInfo);
        });
    };

    $scope.deleteTicket = function(index) {
        let confirm = $mdDialog.confirm()
            .title('Delete the Ticket?')
            .textContent('Are you sure you want to delete me?')
            .ariaLabel('Delete Ticket')
            .ok('Delete me')
            .cancel("Don't delete me");
        $mdDialog.show(confirm).then(() => {
            ticketFactory.deleteTicket(index);
        },() => {
            console.log('not deleted');
        });
    };
});

app.controller('dialogCtrl', function($scope, $mdDialog, ticket) {
    $scope.ticket = ticket;
    
});

app.directive('templateMaker', function(){
    return {
        restrict:'E',
        templateUrl:'./views/templateMaker.html',
        controller:'templateMakerCtrl'
    };
});

app.controller('templateMakerCtrl',function($scope, templateFactory, $mdDialog) {
    $scope.selectedTemplate = {
        id: '',
        doc: {
            name: '',
            items: []
        }
    };
    $scope.item = {
        value:'',
        label:'Place holder',
        type: 'text'
    };
    $scope.templates = []; //TODO: Create service to pull templates from a DB. Maybe use pouchDB?
   
    $scope.inputTypes = ['checkbox','text'];
    
    $scope.addItem = function () {
        $scope.selectedTemplate.doc.items.push($scope.item);
        $scope.item = new templateFactory.templateItem();
    };

    $scope.moveUp = function(index) {
        console.log(index);
        let items = $scope.selectedTemplate.doc.items;
        let swapIndex = index - 1;
        if(index === 0){
            swapIndex = items.length - 1;
        }
        swapItems(index,swapIndex);
    };
    
    $scope.moveDown = function(index) {
        let items = $scope.selectedTemplate.doc.items;
        let swapIndex = index + 1;
        if(index === items.length -1){
            swapIndex = 0;
        }
        swapItems(index,swapIndex);
    };

    $scope.deleteItem = function(index) {
        if(confirm('Are you sure?') === true) {
            console.log($scope.selectedTemplate.doc.items);
            $scope.selectedTemplate.doc.items.splice(index,1);
        }
    };

    $scope.editItem = function(index) {
        let item = $scope.selectedTemplate.doc.items[index];
        let inputTypes = $scope.inputTypes;
        $mdDialog.show({
            controller: $scope => {$scope.item = item, $scope.inputTypes = inputTypes;},
            templateUrl:'/views/itemDialog.tmpl.html',
            parent: angular.element(document.body),
            clickOutsideToClose:true,
        });
    };

    function swapItems(index,swapIndex) {
        let items = $scope.selectedTemplate.doc.items;
        let selected = items[index],
            swap = items[swapIndex];
        items[index] = swap;
        items[swapIndex] = selected;
    }
    

    $scope.saveTemplate = function () {  
        if($scope.selectedTemplate.id === '') {
            templateFactory.addTemplate($scope.selectedTemplate.doc);
        } else {
            templateFactory.updateTemplate($scope.selectedTemplate.doc);
        }
        $mdDialog.show(
            $mdDialog.alert()
            .parent(angular.element(document.body))
            .title('Saved')
            .textContent('Template has been saved')
            .ariaLabel('Saved Template')
            .ok('Cool')
        );
        $scope.refresh();
    };
    $scope.deleteTemplate = function () {
        if($scope.selectedTemplate.doc != undefined) {
            templateFactory.deleteTemplate($scope.selectedTemplate.doc);
            $scope.refresh();
        }
    };
    $scope.updateTemplate = function() {
        templateFactory.updateTemplate($scope.selectedTemplate.doc);
        $scope.refresh();
    };

    $scope.newTemplate = function() {
        $scope.selectedTemplate = {
            id:'',
            doc: {
                name: '',
                items: [],
            }
        };
    };

    $scope.refresh = function() {
        templateFactory.getTemplates().then((doc,err) => {
            $scope.templates = doc.rows;
        });
        return true;
    };

    $scope.refresh();
});

app.factory('ticketFactory', function($window,$mdDialog) {
    let allTickets = [];

    return {
        save: function(ticket) {
            allTickets.push(ticket);
            let jsonTickets = angular.toJson(allTickets);
            $window.localStorage.setItem('allBuildTickets', jsonTickets);
        },
        getAllTickets: function() {
            let tickets = angular.fromJson($window.localStorage.getItem('allBuildTickets'));
            allTickets = tickets || [];
            return allTickets;
        },
        deleteTicket: function(index) {
            allTickets.splice(index,1);
            let jsonTickets = angular.toJson(allTickets);
            $window.localStorage.setItem('allBuildTickets', jsonTickets);
        },
        editTicket: function(ticket, index) {
            allTickets[index] = ticket;
            let jsonTickets = angular.toJson(allTickets);
            $window.localStorage.setItem('allBuildTickets', jsonTickets);
        }
    };
});

/*
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
            this._id = (new Date()).toISOString();
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
*/
app.factory('templateFactory', function () {

    let db = new PouchDB('templates');
    let remoteCouch = 'http://192.168.1.179/api/couchdb';

    /*db.changes({
        since:'now',
        live:true
    }).on('change',$scope.$apply);*/

    db.sync(remoteCouch, {
        live: true
      }).on('change', function (change) {
            console.log('It worked %s',JSON.stringify(change));
        });
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
            db.post(newTemplate, (err, result) => {
                if(!err) {
                    console.log('Success');
                    console.log(result);
                }
            });
        },
        updateTemplate: function(newTemplate) {
            db.put(newTemplate);
        },
        deleteTemplate: function(template) {
            db.remove(template);
        },
        getTemplates: function() {
            return db.allDocs({include_docs: true});
        }

    };
});