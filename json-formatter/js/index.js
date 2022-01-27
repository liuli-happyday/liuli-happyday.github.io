
var timer = 0;
// 防抖动
function debounce(fn) {
    clearTimeout(timer);
    timer = setTimeout(function() {
        fn && fn();
    }, 500);
}

// 获取随机字符串
function randomStr(num) {
    if (!num) num = 8;
    var word = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var str = '';
    for (var i = 0; i < num; i++) {
        str += word[Math.floor(Math.random() * 36)];
    }
    return str;
}

// 判断是否是正确的JSON格式
function isJSON(val) {
    try {
        return JSON.parse(val);
    } catch(e1) {
        // 数据格式错误
        // console.log(e1);
        jsonObj = 'json' + randomStr();
        // console.log(jsonObj);
        try {
            // console.log(jsonObj + '=' + val);
            // console.log(eval(jsonObj + '=' + val));
            // console.log(jsonObj);
            // return window[jsonwtitenwk];
            return eval(jsonObj + '=' + val);
        } catch (e2) {
            // console.log(e2);
            return false;
        }
        // return false;
    }
}

// 填充空格
function fillSpace(count) {
    var space = '';
    count = count * 4; // 填充 4 个
    for (var i = 0; i < count; i++) {
        space += '&nbsp;';
    }
    return space;
}

var toString = Object.prototype.toString;
// 处理数据
function formatData(ele, data, deep, innerObj) {

    if (!deep) {
        deep = 1;
    }
    // var typeStr = Object.prototype.toString.call(data);
    var typeStr = toString.call(data);
    if ('[object Array]' === typeStr) {
        // 数组
        // console.log('arr--',  data);
        ele.appendChild(creatEle('div', fillSpace(deep - 1) + (innerObj ? '<span class="json_key">"' + innerObj + '"</span>' + ':' : '') + '[', 'prefix'));

        var len = data.length;

        for(var i = 0; i < len; i++) {

            var val = data[i];
            var type = toString.call(val);
            var isNum = type === '[object Number]';
            var isStr = type === '[object String]';

            if (isNum || isStr) {

                var span = creatEle('span', isStr ? '"' + val + '"' : val, isNum ? 'json_number': 'json_string');
                var div = creatEle('div', '', '');
                div.innerHTML = fillSpace(deep);
                div.append(span, i === len - 1 ? '' : ',');
                ele.append(div);

            } else {
                formatData(ele, val, deep + 1, data[i]);
            }
        }

        ele.appendChild(creatEle('div', fillSpace(deep - 1) + ']' + (innerObj ? ',' : ''), 'subfix'));
    } else if ('[object Object]' === typeStr) {
        // 对象
        // console.log('obj--',  data);
        ele.appendChild(creatEle('div', fillSpace(deep - 1) + (innerObj ? '<span class="json_key">"' + innerObj + '"</span>' + ':' : '') + '{', 'prefix'));

        var keyList = []; // 获取所有的key

        for(var key in data) {
            keyList.push(key);
        }

        var keyLen = keyList.length;
        var count = 0;

        for(var key in data) {
            // console.log(key);
            count++;

            var val = data[key];
            var type = toString.call(val);
            var isNum = type === '[object Number]';
            var isStr = type === '[object String]';

            if (isNum || isStr) {
                var spanKey = creatEle('span', '"' + key + '"', 'json_key');
                var spanVal = creatEle('span', isStr ? '"' + val + '"' : val, isNum ? 'json_number': 'json_string');
                var div = creatEle('div', '', '');
                div.innerHTML = fillSpace(deep);
                div.append(spanKey, ':', spanVal, count === keyLen ? '' : ',');
                ele.append(div);
            } else {
                formatData(ele, val, deep + 1, key);
            }
            
        }
        // ele.lastChild

        ele.appendChild(creatEle('div', fillSpace(deep - 1) + '}' + (innerObj ? ',' : ''), 'subfix'));
    }
}

// 创建element
 function creatEle(tag, val, cls) {
     var ele = document.createElement(tag);
     ele.className = cls;
     ele.innerHTML = val;
     return ele;
 }

 // 创建文本node
//  function creatEle(tag, val, cls) {
//     var ele = document.create;
//     ele.className = cls;
//     ele.innerHTML = val;
//     return ele;
// }

window.onload = function () {
    var inputEle = document.getElementById('input');
    var formatEle = document.getElementById('format');

    inputEle.addEventListener('input', function(e) {
        debounce(function() {
            // console.log(e);
            var val = inputEle.value.trim();

            if (val) {
                var json = isJSON(val);
                if (json) {
                    // console.log(json);
                    formatEle.innerHTML  = '';
                    formatData(formatEle, json);
                } else {
                    formatEle.innerHTML = '请输入正确的JSON数据';
                }
            }
            // console.log(val);
            // formatEle.innerHTML = val;
        });
    });
}
