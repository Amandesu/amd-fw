var fwjs, require, define;

(function (global, setTimeout) {
    var req, 
        ob = Object.prototype,
        toString = ob.toString,
        hasOwn = ob.hasOwnProperty,
        version = "1.0.0",
        contexts = {},
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
                parentName = parentModuleMap ? parentModuleMap.name : "";
            if (!name) {
                if (!name) {
                    isDefine = false;
                    name = 'fw' + (requireCounter += 1);
                }
            }
            if (name) {
                 normalizedName = normalize(name, parentName);
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
                    //Enable this module and dependencies.
                    //Will call this.check()
                    this.enable();
                } else {
                    //this.check();
                }
            },
            enable:function(){
                this.enabled = true;
                this.enabling = true;
                this.depMaps.forEach(function(depMap) {
                    console.log(depMap)
                })
            }
        }
        // require函数
        function localRequire(deps, callback){
            //console.log(deps, callback)
            var requireMod = getModule(makeModuleMap(null));
            requireMod.init(deps, callback, {enabled:true});
            
        }
        context.Module = Module;
        context.require = localRequire;
        
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


}(this, (typeof setTimeout === 'undefined' ? undefined : setTimeout)))