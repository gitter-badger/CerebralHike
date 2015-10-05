﻿/// <reference path="../1_Bootstrap/app.bootstrap.ts" />
module cerebralhike {
	export class FeatureService {
		public static Alias = "FeatureService";
		//public static $inject = ['$q', ErrorsService.Alias, DeviceStatusService.Alias, '$timeout'];

        constructor(public apiFactory: ApiFactory, public $q: angular.Enhanced.IQService)
		{ }

        public Features: IFeature[] = null;

        //public LoadFeatures(): angular.IPromise<void> {
        //    if (this.Features) {
        //        return this.$q.when();
        //        console.log("Features is populated already");
        //    }
        //    var deferred = this.$q.defer<void>();
        //    var featureProviders = [this.apiFactory.GetFeaturesList, this.apiFactory.GetFeaturesList1,
        //        this.apiFactory.GetFeaturesList2, this.apiFactory.GetFeaturesList3,
        //        this.apiFactory.GetFeaturesList4,
        //        this.apiFactory.GetFeaturesList5, this.apiFactory.GetFeaturesList6];
        //    var validLink = false;
        //    var fpIndex = 0;
        //    var result;
        //    while (!validLink && fpIndex < featureProviders.length) {
        //        var fp = featureProviders[fpIndex++];
        //        var promise = fp();
        //        promise.then(a=> {
        //            validLink = true;
        //            console.log("ooooooooooooooooooooooooJackpot");
        //        });
        //    }
            
        //    this.Features = [];
        //    return this.$q.when();
        //}


        public LoadFeatures(): angular.IPromise<void> {
            if (this.Features) {
                return this.$q.when();
            }
            var deferred = this.$q.defer<void>();
            this.apiFactory.GetFeaturesList()
                .then(features=> {
                    this.Features = features;
                    var videoPathComposer = this.apiFactory.GetVideoPathComposer();
                    var featureUpdater = (feature: IFeature, index:number) => {
                        feature.Id = index;
                        feature.ClipMain = videoPathComposer(feature.ClipMain);
                        feature.ClipExtra = videoPathComposer(feature.ClipExtra);
                    }
                    this.Features.forEach((feature, index) => featureUpdater(feature, index + 1));
                    deferred.resolve();
                })
                .catch(reason=> deferred.reject(reason));
            return deferred.promise;
        }

        public GetFeature(featureId: string): IFeature {
            if (!this.Features) throw "No features loaded yet";
            for (var i = 0, lngth = this.Features.length; i < lngth; i++) {
                if (this.Features[i].Id === parseInt(featureId)) {
                    return this.Features[i];
                }
            }
            throw "Couldn't find feature with id: " + featureId;
        }
	}

	cerebralhikeServices.service(FeatureService.Alias, FeatureService);
}

