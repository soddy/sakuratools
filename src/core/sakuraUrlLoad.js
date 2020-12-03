(function(sakura){
    var r = (new Date()).valueOf();
    // 加载资源数和总资源数的比
    var _loadPer = 0;
    //要加载的总资源数
    var _totalLoadRes = 0;
    //单个文件资源比
    var _loadSinglePer = 0;
    //当前已经加载的资源数
    var _loadedLoadRes = 0;
    //加载资源返回blob写入_images
    var _images = {};

    sakura.loadScene = function(sceneName, progressFun, completeFun, cdn){
        _loadPer = _totalLoadRes = _loadSinglePer = _loadedLoadRes = 0;
        _images = {};
        sakura.data.resource = {};
        //判断是否是字符串
        if(typeof(sceneName) === 'string'){
            var loader = new createjs.LoadQueue(false);
            if(sceneName.indexOf('.json')!=-1){
                //json文件
                //json文件格式 [{"src":"http://domain/_2020.png", "id":"_2020"}] 数组对象
                loader.loadManifest('js/resource/'+sceneName);
                loader.on("fileload", function(e){
                    var manifestArr = e.result;
                    manifestArr = manifestArr.delEmptyObj();
                    if(manifestArr.length != 0) {
                        if(cdn != undefined){
                            for(var i=0;i<manifestArr.length;i++){
                                if(manifestArr[i].src.indexOf('http') == -1 && manifestArr[i].src.indexOf('https') == -1){
                                    var manifestSplit = manifestArr[i].src.split('/');
                                    manifestArr[i].src = cdn + manifestSplit[manifestSplit.length-1];
                                }
                            }
                        }
                        _onRESProgress(manifestArr, function (pre) {
                            progressFun(pre);
                        }, function (e) {
                            completeFun(e);
                        });
                    }else{
                        progressFun(100);
                        completeFun(true);
                    }
                });
            }else{
                //class文件
                //加载格式  'index'
                var fileArr = [];
                if(cdn != undefined){
                    fileArr.push(cdn+'animatejs/'+ sceneName +'.js?'+r);
                    fileArr.push(cdn+'js/'+ sceneName +'Class.js?'+r);
                }else{
                    fileArr.push('animatejs/'+ sceneName +'.js?'+r);
                    fileArr.push('js/'+ sceneName +'Class.js?'+r);
                }
                loader.loadManifest(fileArr);
                loader.on("progress", function(evt){
                    progressFun(parseInt(evt.loaded/evt.total * 10));
                });
                loader.on("complete", function(){
                    var manifestArr = get_class_name(sceneName).properties.manifest;
                    manifestArr = manifestArr.delEmptyObj();
                    if(manifestArr.length != 0) {
                        if(cdn != undefined){
                            for(var i=0;i<manifestArr.length;i++){
                                if(manifestArr[i].src.indexOf('http') == -1 && manifestArr[i].src.indexOf('https') == -1){
                                    var manifestSplit = manifestArr[i].src.split('/');
                                    manifestArr[i].src = cdn + manifestSplit[manifestSplit.length-1];
                                }
                            }
                        }
                        _onRESProgress(manifestArr, function (pre) {
                            progressFun(10+parseInt(pre*0.9));
                        }, function (e) {
                            //所有资源加载完成                      
                            var ssMetadata = get_class_name(sceneName).ssMetadata;
                            if(ssMetadata.length != 0){
                                for(var i=0;i<ssMetadata.length;i++){
                                    ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [images[ssMetadata[i].name]], "frames": ssMetadata[i].frames} )
                                }
                            }
                            completeFun(e);
                        });
                    }else{
                        progressFun(100);
                        completeFun(true);
                    }
                });
            }
        }else if(Array.isArray(sceneName)){
            //加载格式  ['index','a.json',{manifest:[{'src':'',id:''}]}]
            sceneName = sceneName.unique3();
            var fileArr = [];
            var jsonFileArr = [];
            var manifest = undefined;
            var sceneName_ = [];
            for(var i=0;i<sceneName.length;i++){
                //先判断有没有json文件，如果有，先处理json文件
                if(typeof(sceneName[i]) === 'string'){
                    if(sceneName[i].indexOf('.json')!=-1){
                        if(cdn != undefined){
                            jsonFileArr.push(cdn+'js/resource/'+sceneName[i]);
                        }else{
                            jsonFileArr.push('js/resource/'+sceneName[i]);
                        }
                    }else{
                        if(cdn != undefined){
                            fileArr.push(cdn+'animatejs/'+ sceneName[i] +'.js?'+r);
                            fileArr.push(cdn+'js/'+ sceneName[i] +'Class.js?'+r);
                        }else{
                            fileArr.push('animatejs/'+ sceneName[i] +'.js?'+r);
                            fileArr.push('js/'+ sceneName[i] +'Class.js?'+r);
                        }
                        sceneName_.push(sceneName[i]);
                    }
                }else if(!Array.isArray(sceneName[i]) && sceneName[i] !== undefined){
                    if(sceneName[i].hasOwnProperty('manifest')){
                        manifest = sceneName[i];
                    }
                }
            }
            var loader = new createjs.LoadQueue(false);
            var jsonManifest = [];
            var loadFlag = true;    //json文件是否load完成
            if(jsonFileArr.length>0){
                loader.loadManifest(jsonFileArr);
                loader.on("fileload", function(e){
                    jsonManifest.push(e.result[0]);
                    loadFlag = false;
                });
                loader.on("error", function(e){
                    loadFlag = false;
                });
            }else{
                loadFlag = false;   //如果没有json文件，相当于直接load json文件完成
            }
            var st = setInterval(function(){
                if(!loadFlag){
                    clearInterval(st);
                    var loader1 = new createjs.LoadQueue(false);
                    loader1.loadManifest(fileArr);
                    loader1.on("progress", function(evt){
                        progressFun(parseInt(evt.loaded/evt.total * 10));
                    });
                    loader1.on("complete", function(){
                        var manifestArr = [];
                        var ssMetadata = [];
                        for(var i=0;i<sceneName_.length;i++){
                            manifestArr = manifestArr.concat(get_class_name(sceneName_[i]).properties.manifest);
                            ssMetadata = ssMetadata.concat(get_class_name(sceneName_[i]).ssMetadata);
                        }
                        if(jsonManifest.length>0){
                            manifestArr = manifestArr.concat(jsonManifest);
                        }
                        if(manifest != undefined){
                            manifestArr = manifestArr.concat(manifest['manifest']);
                        }
                        manifestArr = manifestArr.delEmptyObj();
                        if(manifestArr.length != 0){
                            manifestArr = uniqe_by_keys(manifestArr, ['src','id']);
                            if(cdn != undefined){
                                for(var i=0;i<manifestArr.length;i++){
                                    if(manifestArr[i].src.indexOf('http') == -1 && manifestArr[i].src.indexOf('https') == -1){
                                        var manifestSplit = manifestArr[i].src.split('/');
                                        manifestArr[i].src = cdn + manifestSplit[manifestSplit.length-1];
                                    }
                                }
                            }
                            _onRESProgress(manifestArr, function(pre){
                                progressFun(10+parseInt(pre*0.9));
                            }, function(e){
                                //所有资源加载完成
                                if(ssMetadata.length != 0){
                                    ssMetadata = uniqe_by_keys(ssMetadata, ['name','frames']);
                                    for(var i=0;i<ssMetadata.length;i++){
                                        ss[ssMetadata[i].name] = new createjs.SpriteSheet( {"images": [images[ssMetadata[i].name]], "frames": ssMetadata[i].frames} )
                                    }
                                }
                                completeFun(e);
                            });
                        }else{
                            progressFun(100);
                            completeFun(true);
                        }
                    });
                }
            },20);
        }else if(!Array.isArray(sceneName) && sceneName !== undefined){
            // {manifest:[{'src':'http://domain/img.png',id: 'img'}]}   必须是manifest数组对象
            if(sceneName.hasOwnProperty('manifest')){
                if(sceneName.manifest.length != 0){
                    var manifestArr = uniqe_by_keys(sceneName.manifest, ['src','id']);
                    manifestArr = manifestArr.delEmptyObj();
                    if(manifestArr.length != 0){
                        if(cdn != undefined){
                            for(var i=0;i<manifestArr.length;i++){
                                if(manifestArr[i].src.indexOf('http') == -1 && manifestArr[i].src.indexOf('https') == -1){
                                    var manifestSplit = manifestArr[i].src.split('/');
                                    manifestArr[i].src = cdn + manifestSplit[manifestSplit.length-1];
                                }
                            }
                        }
                        _onRESProgress(manifestArr, function(pre){
                            progressFun(pre);
                        }, function(e){
                            completeFun(e);
                        });
                    }else{
                        progressFun(100);
                        completeFun(true);
                    }
                }else{
                    progressFun(100);
                    completeFun(true);
                }
            }
        }
        function _onRESProgress(manifestArr, progressFun, completeFun) {
            if(manifestArr.length > 0){
                _totalLoadRes = manifestArr.length;
                _loadSinglePer = 1 / _totalLoadRes;
                var urlLoader = new sakura.UrlLoader();
                sakura.loadMulti(0, manifestArr, urlLoader);
                if(progressFun){
                    var st = setInterval(function(){
                        if(urlLoader.getTotal() !=0){
                            if(_loadedLoadRes == _totalLoadRes){
                                clearInterval(st);
                                progressFun(100);
                                if(completeFun){
                                    completeFun(true);
                                }
                            }else{
                                progressFun(parseInt((_loadPer + urlLoader.getLoaded() / urlLoader.getTotal() * _loadSinglePer) * 100));
                            }
                        }
                    },20);
                }
            }
        }
    };
    sakura.loadMulti = function(index, resourceArr, urlLoader){
        if(index < resourceArr.length){
            urlLoader.load(resourceArr[index].src, resourceArr[index].id, function(e){
                if(typeof(images)!='undefined'){
                    images[resourceArr[index].id] = e;
                }
                _loadPer += _loadSinglePer;
                index++;
                _loadedLoadRes = index;
                sakura.loadMulti(index, resourceArr, urlLoader);
            });
        }
    };
    sakura.UrlLoader = function(){
        this.loaded = 0;
        this.total = 0;
        this.load = function(url, id, callbackFun){
            var _self = this;
            _self.loaded = 0;
            _self.total = 0;
            var req = new XMLHttpRequest();
            req.open('GET', url, true);
            req.addEventListener('progress', function(evt){
                if(evt.lengthComputable){
                    _self.loaded = evt.loaded;
                    _self.total = evt.total;
                }
            }, false);
            req.responseType = "blob";
            req.addEventListener('load', function(){
                window.URL = window.URL || window.webkitURL;
                if (this.status === 200) {
                    var blob = this.response;

                    var imgRegex = /([^\s]+(?=\.(jpg|png|jpeg|gif))\.\2)/gi;
                    var audioRegex = /([^\s]+(?=\.(ac3|m4a|mp3|ogg))\.\2)/gi;
                    var videoRegex = /([^\s]+(?=\.(mp4))\.\2)/gi;
                    var ire = new RegExp(imgRegex);
                    if (ire.test(url.toLowerCase())){
                        var img = document.createElement("img");
                        img.src = window.URL.createObjectURL(blob);
                        sakura.data.resource[id] = img.src;
                    }
                    var are = new RegExp(audioRegex);
                    if (are.test(url.toLowerCase())){
                        var audio = document.createElement("audio");
                        audio.src = window.URL.createObjectURL(blob);
                        sakura.data.resource[id] = audio.src;
                    }
                    var vre = new RegExp(videoRegex);
                    if (vre.test(url.toLowerCase())){
                        var video = document.createElement("video");
                        video.src = window.URL.createObjectURL(blob);
                        sakura.data.resource[id] = video.src;
                        video.setAttribute("id", id);
                        video.setAttribute("crossorigin", "anonymous");
                        video.setAttribute("webkit-playsinline", "true");
                        video.setAttribute("playsinline", "true");
                        video.setAttribute("preload", "true");
                        video.setAttribute("x5-video-player-type", "h5-page");
                        video.setAttribute("style", "width:100%; position:absolute; z-index:1; display:none;");
                        video.setAttribute("src", video.src);
                        document.body.appendChild(video);
                    }
                    callbackFun(img);
                }else if(this.status == 404){
                    callbackFun(false);
                }
            });
            req.send();
        };
        this.getLoaded = function(){
            return this.loaded;
        };
        this.getTotal = function(){
            return this.total;
        }
    };
})(sakura || (sakura = {}));