'use strict';

angular.module('bahmni.registration')
    .directive('patientRelationshipInfoSection', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/patientRelationshipInfo.html',
            controller: 'PatientRelationshipInfoController',
            scope: {
                patient: '='
            }
        };
    })
    .controller('PatientRelationshipInfoController', ['$scope', '$rootScope',
        function ($scope, $rootScope) {
            var RELATIONSHIP_ATTR = 'relationship';
            var CONTACTS_ATTR = 'relationshipContacts';
            var DATA_ATTR = 'comments';

            $scope.relationshipAttribute = _.find($rootScope.patientConfiguration.attributeTypes, {name: RELATIONSHIP_ATTR});

            var parseListFromPatient = function () {
                var commentsVal = $scope.patient[DATA_ATTR];
                try {
                    if (commentsVal && typeof commentsVal === 'string' && commentsVal.trim().charAt(0) === '[') {
                        return JSON.parse(commentsVal);
                    }
                } catch (e) {}

                return [{
                    typeConceptUuid: $scope.patient[RELATIONSHIP_ATTR] ? $scope.patient[RELATIONSHIP_ATTR].conceptUuid : null,
                    contacts: $scope.patient[CONTACTS_ATTR] || '',
                    data: typeof commentsVal === 'string' && commentsVal.trim().charAt(0) !== '[' ? commentsVal : ''
                }];
            };

            var syncToPatient = function (list) {
                if (!list || list.length === 0) {
                    $scope.patient[DATA_ATTR] = undefined;
                    $scope.patient[RELATIONSHIP_ATTR] = undefined;
                    $scope.patient[CONTACTS_ATTR] = undefined;
                    return;
                }
                $scope.patient[DATA_ATTR] = JSON.stringify(list);
                var first = list[0];
                $scope.patient[RELATIONSHIP_ATTR] = first.typeConceptUuid ? {conceptUuid: first.typeConceptUuid} : undefined;
                $scope.patient[CONTACTS_ATTR] = first.contacts || undefined;
            };

            $scope.addEntry = function () {
                $scope.patient.relationshipInfoList.push({typeConceptUuid: null, contacts: '', data: ''});
            };

            $scope.removeEntry = function (index) {
                $scope.patient.relationshipInfoList.splice(index, 1);
            };

            var init = function () {
                // Watch the patient object reference — fires immediately and again when the
                // parent controller replaces $scope.patient after the server response (edit mode).
                $scope.$watch('patient', function (newPatient) {
                    if (newPatient && !newPatient.relationshipInfoList) {
                        newPatient.relationshipInfoList = parseListFromPatient();
                    }
                });

                // Sync list changes back to flat attributes (for save).
                // Guard against undefined: when patient is replaced the list briefly disappears;
                // calling syncToPatient(undefined) here would erase the freshly-loaded data.
                $scope.$watch('patient.relationshipInfoList', function (newVal) {
                    if (newVal !== undefined) {
                        syncToPatient(newVal);
                    }
                }, true);

                // Support external trigger from legend "+" button
                $scope.$watch('patient._addRelEntryRequest', function (newVal, oldVal) {
                    if (newVal && newVal !== oldVal) {
                        $scope.addEntry();
                    }
                });
            };

            init();
        }
    ]);
