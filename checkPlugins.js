/**
 * @file 用于查找fis plugin
 */

function getFis3Name(pluginInfo) {
    return ['fis3'].concat(pluginInfo).join('-');
}

function getFisName(pluginInfo) {
    return ['fis'].concat(pluginInfo).join('-');
}

var MODULE_MISSING = 'unknown';

function checkModule(pluginInfo) {
    var name = pluginInfo.join('-');

    var fis3Name = 'fis3-' + name;
    var fisName = 'fis-' + name;

    var regFis3Name = RegExp('\\b' + fis3Name + '\\b');
    var regFisName = RegExp('\\b' + fisName + '\\b');

    var foundModule;
    try {
        foundModule = fis.require(pluginInfo[0], pluginInfo[1]);
    } catch (e) {
        return MODULE_MISSING;
    }
    
    var keys = Object.keys(require.cache);
    for (var i = 0; i < keys.length; i++) {
        var filePath = keys[i];
        
        if (require.cache[filePath].exports === foundModule) {
            
            if (regFis3Name.test(filePath)) {

                return fis3Name;
            } else if(regFisName.test(filePath)){
                return fisName;
            } else {
                return filePath;
            }

        }
    }

    return MODULE_MISSING;
}

function uniqPlugins(pluginInfos) {
    var ret = [];
    var map = {};
    function addPlugin(stage, plugin) {
        map[stage] = map[stage] || {};
        map[stage][plugin] = 1;
    }
    pluginInfos.forEach(function (pluginInfo) {
        addPlugin(pluginInfo[0], pluginInfo[1]);
    });

    Object.keys(map).forEach(function (stage) {
        Object.keys(map[stage]).forEach(function (plugin) {
            ret.push([stage, plugin]);
        });
    });

    return ret;
}

function getPluginInfos(pluginInfos) {
    var ret = {
        known: [],
        missing: []
    };
    pluginInfos = uniqPlugins(pluginInfos);

    pluginInfos.map(function (plugin) {
        var checkRet = checkModule(plugin);
        if (checkRet !== MODULE_MISSING) {
            ret.known.push(checkRet);
        } else {
            ret.missing.push(getFis3Name(plugin) + ' or ' + getFisName(plugin));
        }
    });
    return ret;
}

function formatPluginInfo(checkedPluginInfos) {
    if (checkedPluginInfos.known.length) {
        console.log('installed plugins:');
        checkedPluginInfos.known.forEach(function (name) {
            console.log('  ' + name);
        });
    }
    if (checkedPluginInfos.missing.length) {
        console.log('missing plugins:');
        checkedPluginInfos.missing.forEach(function (name) {
            console.log('  ' + name);
        });
    } else {
        console.log();
        console.log('no more plugin are needed');
    }
}

function outputPluginInfo(pluginInfos) {
    if(!pluginInfos.length){
        console.log('no plugin need');
        return;
    }
    formatPluginInfo(getPluginInfos(pluginInfos));
}

module.exports = {
    getPluginInfos: getPluginInfos,
    formatPluginInfo: formatPluginInfo,
    outputPluginInfo: outputPluginInfo,
}
