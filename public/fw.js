var fwjs, require, define;

(function (global, setTimeout) {
    var req, 
        ob = Object.prototype,
        toString = ob.toString,
        hasOwn = ob.hasOwnProperty,
        version = "1.0.0",
        contexts = {},
        head = document.getElementsByTagName('head')[0],
        globalDefQueue = [],
        defContextName ="_";

    function isFunction(f) {
        return toString.call(f) == "[object Function]"
    }
    function isArray(arr) {
        return toString.call(arr) == "[object Array]"
    }
    function getOwn(obj, prop) {
        return hasOwn.call(obj, prop) && obj[prop];
    }
    var path = {};
    path.resolve = function(base, relative) {
        var parentDots = "";
        var basePrefix = ""
        if (!base) {
            return relative;
        }
        base = base.replace(/(\.\.\/)+/, function(str) {
            basePrefix = str;
            return ""
        })
        base = base.split("/");
        relative = relative.replace(/^\.\//, "").replace(/(\.\.\/)+/, function(str) {
            parentDots = str;
            return ""
        });
        while (parentDots) {
            base = base.slice(0, -1);
            parentDots = parentDots.substring(3); 
        } 
        return basePrefix+base.join("/").concat("/"+relative)
    }
    function newContext(){
        var context = {},
            registry = {},
            undefEvents = {},
            defined = {},
            urlLoaded = {},
            defQueue=[],
            requireCounter = 1
        ;
        function normalize(name, parentName){
            name = name.replace(/^\.\//, "")
            return path.resolve(parentName, name)
        }
        function makeModuleMap(name, parentModuleMap){
            var isDefine = true,
                normalizedName = "",
                originalName = name,
                url = name,
                parentName = parentModuleMap ? parentModuleMap.name : "";
            if (!name) {
                if (!name) {
                    isDefine = false;
                    name = 'fw' + (requireCounter += 1);
                }
            }
            if (name) {
                 //normalizedName = normalize(name, parentName);
                 normalizedName = name;
                 isNormalized = true;
                //url = context.nameToUrl(normalizedName); */
            }
            return {
                name: normalizedName,
                parentMap: parentModuleMap,
                url: name,
                originalName: originalName,
                isDefine: isDefine,
                id: normalizedName
            };
        }
        function getModule(depMap) {
            var id = depMap.id,
                mod = getOwn(registry, id);

            if (!mod) {
                mod = registry[id] = new context.Module(depMap);
            }

            return mod;
        }
        // 构建Module类
        function Module(map){
            this.events = getOwn(undefEvents, map.id) || {};
            this.map = map;
            this.depExports = [];
            this.depMaps = [];
            this.depMatched = [];  // 依赖是否已defined
            this.depCount = 0;
        }
        Module.prototype = {
            init: function(depMaps, factory, options){
                if (this.inited) {
                    return;
                }
                options = options || {};
                this.factory = factory;
                this.inited = true;
                this.depMaps = depMaps && depMaps.slice(0);

                if (options.enabled || this.enabled) {
                    this.enable();
                } else {
                    this.check();
                }
            },
            enable:function(){
                this.enabled = true;
                this.enabling = true;
                this.depMaps.forEach(function(depMap, i) {
                    var mode = null;
                    if (typeof depMap == "string") {
                        depMap = makeModuleMap(depMap, this.map.isDefine ? this.map : null);
                        mod = getOwn(registry, depMap.id);
                        
                        this.depCount += 1;
                        this.depMaps[i] = depMap;
                        var fn = function (depExports) {
                            if (!this.depMatched[i]) {
                                this.depMatched[i] = true;
                                this.depCount -= 1;
                                this.depExports[i] = depExports;
                            }
                            this.check();
                        }.bind(this)
                        // 如果模块已经加载过
                        if (getOwn(defined, depMap.id) && mod.defineEmitComplete) {
                            fn(defined[depMap.id]);
                        } else {
                            mod = getModule(depMap);
                            mod.on("defined", fn)  
                        }
                        mod = registry[depMap.id];
                        if (mod && !mod.enabled) {
                            //context.enable(depMap, this);
                            mod.enable()
                        }
                        //console.log(mod)
                    }
                }.bind(this))

                this.enabling = false;
                this.check();
            },
            check:function(){
                if (!this.enabled || this.enabling) {
                    return;
                }
                var err, cjsModule,
                    id = this.map.id,
                    depExports = this.depExports,
                    exports = this.exports,
                    factory = this.factory;

                
                if (!this.inited) {
                    //if (!hasProp(context.defQueueMap, id)) {
                    this.load();
                } else if (!this.defining){
                    this.defining = true;        // defining下面代码每个模块只执行一次
                    if (isFunction(factory)) {   // 模块的factory只允许是函数
                        if (this.depCount < 1) {       // 只有暴露出exports defined属性才为true
                            exports = factory.apply(this, depExports)
                        }
                        this.exports = exports;
                        if (this.map.isDefine) {
                            defined[id] = exports;
                        }
                    }     
                    this.defining = false;
                    this.defined = true;        
                    
                    if (this.defined && !this.defineEmitted) {
                        this.defineEmitted = true;
                        this.emit('defined', this.exports);
                        this.defineEmitComplete = true;
                    } 
                }
               
            },
            load(){
                if (this.loaded) {
                    return;
                }
                this.loaded = true;
                var url = this.map.url;

                //Regular dependency.
                if (!urlLoaded[url]) {
                    urlLoaded[url] = true;
                    req.load(context, this.map.id, url) 
                }
            },
            on: function (name, cb) {
                var cbs = this.events[name];
                if (!cbs) {
                    cbs = this.events[name] = [];
                }
                cbs.push(cb);
            },
            emit: function(name, data){
                var evts = this.events[name] || [];
                evts.forEach(function(cb){
                    cb(data);
                })
            }
        }
        // require函数
        function localRequire(deps, callback){
            //console.log(deps, callback)
            var requireMod = getModule(makeModuleMap(null));
            requireMod.init(deps, callback, {enabled:true});
            
        }
        // 将globalQueue转入defQueue
        function getGlobalQueue() {
            //Push all the globalDefQueue items into the context's defQueue
            if (globalDefQueue.length) {
                globalDefQueue.forEach(function(queueItem) {
                    var id = queueItem[0];
                    if (typeof id === 'string') {
                        context.defQueueMap[id] = true;
                    }
                    defQueue.push(queueItem);
                });
                globalDefQueue = [];
            }
        }
        context.Module = Module;
        context.require = localRequire;
        context.onScriptLoad = function(evt){
            if (evt.type == "load") {
                var node = evt.currentTarget || evt.srcElement;
                node.removeEventListener('load', context.onScriptLoad, false);
                var id = node.getAttribute('data-fwmodule')
                context.completeLoad(id);
            }
        };
        context.completeLoad = function(moduleName){
            var found, args;
            // 提取当前载入的模块
            getGlobalQueue();
            while (defQueue.length) {
                args = defQueue.shift();
                if (args[0] === null) {
                    args[0] = moduleName;
                    if (found) {
                        break;
                    }
                    found = true;
                } else if (args[0] === moduleName) {
                    found = true;
                }
                if (!getOwn(defined, args[0])) {
                    // 依赖载入完成之后，对文件进行初始化

                    getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
                }
            }
        }
        return context;
    }
    req = fwjs = require = function(deps, callback) {
        var context = {},
            contextName = defContextName;
        if (isFunction(deps)) {
            deps = [];
            callback = deps
        }
        context = getOwn(contexts, contextName);
        if (!context){
            context = contexts[contextName] = newContext();
        }
        return context.require(deps, callback)
    }
    // 创建script节点
    req.createScriptNode = function () {
        var node =  document.createElement('script');
        node.type = 'text/javascript';
        node.charset = 'utf-8';
        node.async = true;
        return node;
    };
    // 载入文件
    req.load = function(context, moduleName, url){
        var node = req.createScriptNode();
        node.setAttribute('data-fwmodule', moduleName);
        node.addEventListener('load', context.onScriptLoad, false);
        node.src = url;
        head.appendChild(node)
    }
    // define只允许匿名模块
    define = function(deps, callback){
        if (!isArray(deps)) {
            callback = deps;
            deps = [];
        }
        var name = null, context;
        globalDefQueue.push([name, deps, callback]);
        globalDefQueue[name] = true;
    }

}(this, (typeof setTimeout === 'undefined' ? undefined : setTimeout)))