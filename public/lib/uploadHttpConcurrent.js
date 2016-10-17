(function() {
  'use strict';
  /**
   * Upload Bandwidth testing based on httpRequests
   * @param string server endpoint for upload testing
   * @param string post for get request
   * @param integer number of concurrentRuns
   * @param integer timeout of the request
   * @param integer length of the testLength
   * @param function callback function for test suite complete event
   * @param function callback function for test suite progress event
   * @param function callback function for test suite abort event
   * @param function callback function for test suite timeout event
   * @param function callback function for test suite error event
   * @param integer uploadSize of the request
   */
  function uploadHttpConcurrent(url, type, concurrentRuns, timeout, testLength,callbackComplete, callbackProgress,
  callbackError, uploadSize) {
    this.url = url;
    this.type = type;
    this.uploadSize = uploadSize;
    this.concurrentRuns = concurrentRuns;
    this.timeout = timeout;
    this.testLength = testLength;
    this._test = null;
    this._testIndex = 0;
    this._results = [];
    this._activeTests = [];
    this._resultsHolder = {};
    this.clientCallbackComplete = callbackComplete;
    this.clientCallbackProgress = callbackProgress;
    this.clientCallbackError = callbackError;
    this._beginTime = Date.now();
    this._running = true;
};

      /**
      * onTimeout method
      * @param object error object
      * @return error object
      */
      uploadHttpConcurrent.prototype.onTestTimeout = function(error){
        this.clientCallbackError(error);
        this._running = false;
      };

      /**
      * onAbort method
      * @param object error object
      * @return error object
      */
      uploadHttpConcurrent.prototype.onTestAbort = function(error){
        this.clientCallbackError(error);
        this._running = false;
      };

    /**
    * onError method
    * @param object error object
    * @return error object
    */
    uploadHttpConcurrent.prototype.onTestError = function(error){
      this.clientCallbackError(error);
      this._running = false;
    };
    /**
    * onComplete method
    */
    uploadHttpConcurrent.prototype.onTestComplete = function(result){
      if(!this._running){
        return;
      }
     this._results.push(result);
     this['arrayResults'+result.id];
     this._activeTests.pop(result.id,1);
     if((Date.now() - this._beginTime)< this.testLength){
       if(this._activeTests.length ===0 && this._running){
        var movingAverage = 0;
        for (var z=1;z<=this.concurrentRuns;z++){
          movingAverage += this._results[(this._results.length-z)].bandwidth;
        }
         this.clientCallbackProgress(movingAverage);
         this.start();
      }
     }
     else{
        this._running = false;
       this.clientCallbackComplete(this._results);
       for(var i=0;i>this._activeTests.length-1;i++){
         if (typeof(this._activeTests[i])!== 'undefined') {
         this._activeTests[i].xhr._request.abort();
        }
       }
     }
    };

    /**
    * onProgress method
    */
    uploadHttpConcurrent.prototype.onTestProgress = function(result){
        //this.clientCallbackProgress(result);
    };
    /**
    * Start the test
    */
      uploadHttpConcurrent.prototype.start = function() {
        if(!this._running){
          return;
        }
        if (this.type === 'GET') {
          for (var g = 1; g <= this.concurrentRuns; g++) {
            this._testIndex++;
            this['arrayResults'+this._testIndex] = [];
            var request = new window.xmlHttpRequest('POST',this.url,this.timeout, this.onTestComplete.bind(this), this.onTestProgress.bind(this),
            this.onTestAbort.bind(this),this.onTestTimeout.bind(this),this.onTestError.bind(this));
            this._activeTests.push({
              xhr: request,
              testRun: this._testIndex
            });
            request.start(0,this._testIndex);

          }
        }
        else {
          for (var p = 1; p <= this.concurrentRuns; p++) {
            this._testIndex++;
            this['arrayResults'+this._testIndex] = [];
            var request = new window.xmlHttpRequest('POST',this.url,this.timeout, this.onTestComplete.bind(this), this.onTestProgress.bind(this),
            this.onTestAbort.bind(this),this.onTestTimeout.bind(this),this.onTestError.bind(this));
            this._activeTests.push({
              xhr: request,
              testRun: this._testIndex
            });
            request.start(this.uploadSize,this._testIndex);
          }
        }
      }


   window.uploadHttpConcurrent = uploadHttpConcurrent;
   })();
