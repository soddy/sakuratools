/**
 * 将字符串转为类名，首字母大写，如loading=>Loading
 * @param className
 * @returns {Object}
 */
function get_class_name(className){
    var _className = className.substring(0,1).toUpperCase()+className.substring(1);
    return eval(_className);
};
/**
 * 控制台打印调试信息
 */
function trace() {
    var arg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        arg[_i - 0] = arguments[_i];
    }
    for (var i in arguments) {
        console.log(arguments[i]);
    }
};
/**
 * 将对象元素转换成字符串以作比较
 * @param obj
 * @param keys
 * @returns {string}
 * @private
 */
var _obj2key = function(obj, keys){
    var n = keys.length,
        key = [];
    while(n--){
        key.push(obj[keys[n]]);
    }
    return key.join('|');
};
/**
 * 去重操作
 * @param array
 * @param keys
 * @returns {Array}
 */
function uniqe_by_keys(array, keys){
    var arr = [];
    var hash = {};
    for (var i = 0, j = array.length; i < j; i++) {
        var k = _obj2key(array[i], keys);
        if (!(k in hash)) {
            hash[k] = true;
            arr .push(array[i]);
        }
    }
    return arr ;
};
/**
* 数组去重
*/
Array.prototype.unique3 = function(){
    var res = [];
    var json = {};
    for(var i = 0; i < this.length; i++){
        if(!json[this[i]]){
            res.push(this[i]);
            json[this[i]] = 1;
        }
    }
    return res;
};
/**
* 去掉数组中的空对象
*/
Array.prototype.delEmptyObj = function(){
    var res = [];
    for(var i=0;i<this.length;i++){
        if(JSON.stringify(this[i])!='{}'){
            res.push(this[i]);
        }
    }
    return res;
}