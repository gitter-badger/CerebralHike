﻿/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
/// <reference path="../0_typings/ionic/ionic.d.ts" />
/// <reference path="../0_typings/jquery/jquery.d.ts" />
/// <reference path="../0_typings/cordova/plugins/filesystem.d.ts" />

module cerebralhike {

    export class ApiVerbs {
        private static root = 'appdata/';
        private static images = "img/";
        public static FeaturesList = "legend.json";
        public static LegendSource = "https://www.dropbox.com/s/b6nglf3fo770auy/legend.json?dl=1";

        public static GetRoot(): string {
            var url = ApiVerbs.root;
            if (ionic.Platform.isAndroid()) {
                url = "/android_asset/www/" + ApiVerbs.root;
            }
            return url;
        }

        public static GetImagesRoot(): string {
            var url = ApiVerbs.images;
            if (ionic.Platform.isAndroid()) {
                url = "/android_asset/www/" + ApiVerbs.images;
            }
            return url;
        }
    }

    export class LocalVerbs {
        public static GetStorage(): string { return cordova.file.externalDataDirectory; }//cordova.file.dataDirectory;// 'externalDataDirectory'; 
        public static legend = 'legend.json';
    }

    export class Utils {
        public static ToJson<T>(source: T): string {
            var jsonOutput = angular.toJson(source);
            console.log('Serialized object to: ' + jsonOutput);
            return jsonOutput;
        }
    }

    export class ApiFactory {
        public static Alias = "apiFactory";
        constructor(public $http: angular.IHttpService, public $q: angular.Enhanced.IQService, public ErrorsService: ErrorsService) {
        }

      
        public GetOriginalLegend(): angular.IPromise<ICloudFeature[]> {
            return this.GetResponse<ICloudFeature[]>(ApiVerbs.LegendSource);
        }

        public GetLegend(filePath: string): angular.IPromise<IFeature[]> {
            return this.GetResponse<IFeature[]>(filePath);
        }


        public GetFeaturesList = (): angular.IPromise<IFeature[]> => {
            return this.GetResponse<IFeature[]>(ApiVerbs.GetRoot()+"legend.json");
        }

        public GetVideoPathComposer(): ((clip: string) => string) {
            return (clipName: string) => ApiVerbs.GetRoot() + clipName;
        }

        public GetResponse<T>(url: string): angular.IPromise<T> {
            var result = this.$http.get<T>(url);
            console.log('Request made for: ' +url);
            return this.WrapResponse<T>(result);
        }

        public WrapResponse<T>(promise: angular.IHttpPromise<T>): angular.IPromise<T> {
            var deferred = this.$q.defer<T>();
            promise.then(response=> {
                deferred.resolve(response.data)
            }, reason=> {
                var reasonContent = "";
                try {
                    reasonContent = ApiFactory.ExtractContent(reason.data, "#content");
                }
                catch (exc) {
                    reasonContent = reason.data;
                }
                var errorMessage = reason.config.url + " === " + reason.statusText + " === " + reasonContent;
                this.ErrorsService.addError(errorMessage);
                deferred.reject(reason)
            });
            return deferred.promise;
        }

        public static ExtractContent(html: string, elementId: string): string {
            console.log('Extracting json from: ' + html);
            return jQuery(html).filter(elementId).html();
        }
    }

    cerebralhikeServices.factory(ApiFactory.Alias, ($http: angular.IHttpService, $q: angular.Enhanced.IQService, ErrorsService: ErrorsService) => new ApiFactory($http, $q, ErrorsService));
} 

