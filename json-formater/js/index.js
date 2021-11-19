
var timer = 0;
// 防抖动
function debounce(fn) {
    clearTimeout(timer);
    timer = setTimeout(function() {
        fn && fn();
    }, 500);
}

// 判断是否是正确的JSON格式
function isJSON(val) {
    try {
        return JSON.parse(val);
    } catch(e) {
        // 数据格式错误
        // console.log(e);
        return false;
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
function formatData(ele, data, deep) {

    if (!deep) {
        deep = 1;
    }
    // var typeStr = Object.prototype.toString.call(data);
    var typeStr = toString.call(data);
    if ('[object Array]' === typeStr) {
        // 数组
        // console.log('arr--',  data);
        ele.appendChild(creatEle('div', fillSpace(deep - 1) + '[', 'prefix'));

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
                formatData(ele, val, deep + 1);
            }
        }

        ele.appendChild(creatEle('div', fillSpace(deep - 1) + ']', 'subfix'));
    } else if ('[object Object]' === typeStr) {
        // 对象
        // console.log('obj--',  data);
        ele.appendChild(creatEle('div', fillSpace(deep - 1) + '{', 'prefix'));

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
                formatData(ele, val, deep + 1);
            }
            
        }
        // ele.lastChild

        ele.appendChild(creatEle('div', fillSpace(deep - 1) + '}', 'subfix'));
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
