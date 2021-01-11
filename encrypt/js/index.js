window.onload = function () {
    var algoSet = {
        'MD5': {name: 'MD5'},
        'SHA1': {name: 'SHA1'},
        'SHA256': {name: 'SHA256'},
        'SHA512': {name: 'SHA512'},
        'SHA3-224': {name: 'SHA3', param: {outputLength: 224}},
        'SHA3-256': {name: 'SHA3', param: {outputLength: 256}},
        'SHA3-384': {name: 'SHA3', param: {outputLength: 384}},
        'SHA3-512': {name: 'SHA3', param: {outputLength: 512}},
        'RIPEMD-160': {name: 'RIPEMD160'}
    };

    var vm = new Vue({
        el: '#app',
        data: {
            algoList: Object.keys(algoSet).map(function (name) {
                // 默认选中
                return {name: name, selected: name === 'MD5'} //  || name === 'SHA1' || name === 'SHA256'
            }),
            fileList: []
        },
        methods: {
            init: function () {
                var upload = this.$refs.uploadFile;
                upload.onchange = function(e) {
                    var fileList = upload.files;
                    for (var i = 0, length = fileList.length; i < length; i++) {
                        vm.fileHash(fileList[i]);
                    }
                };
            },
            fileHash: function (file) {
                var fileItem = {
                    name: file.name,
                    size: '',
                    hashList: [],
                    message: ''
                };

                vm.fileList.unshift(fileItem);

                vm.getSelectedAlgo().forEach(function (name) {
                    fileItem.hashList.push({name: name, value: '正在计算中...'});
                });

                if (!window.FileReader) {
                    fileItem.message = '当前浏览器不支持 FileReader，推荐使用最新版 Chrome、Firefox';
                    return;
                }

                if (!file.slice && !file.webkitSlice) {
                    fileItem.message = '当前浏览器不支持 分段读取文件，推荐使用最新版 Chrome、Firefox';
                    return;
                }

                if (file.size > 1024 * 1024 * 3000) {
                    fileItem.message = '文件过大，超过 3G';
                    return;
                }

                if (!fileItem.hashList.length) {
                    fileItem.message = '没有需要计算的 hash 值';
                    return;
                }

                fileItem.message = '加载中...';

                new FileHashCalc(file, fileItem);
            },
            getSelectedAlgo: function () {
                return vm.algoList.filter(function (algo) {
                    return algo.selected;
                }).map(function (algo) {
                    return algo.name;
                });
            }
        }
    });

    vm.init();

    function FileHashCalc(file, fileItem) {
        var me = this;

        me.algoList = me.initAlgoList(fileItem.hashList);
        me.timeStart = (new Date()).getTime();

        var chunk;
        var chunkSize = this.chunkSize;
        var fileSize = file.size;
        var readStart = 0, readEnd;
        var sizeText = getSizeText(fileSize);

        var reader = new FileReader();

        reader.onload = function (e) {
            readStart = readEnd;
            me.updateAlgoList(e.target.result, readStart);
            if (readStart < fileSize) {
                fileItem.message = '加载 ' + getSize(readStart) + ' / ' + sizeText;
                setTimeout(readNext, 0);
            } else {
                fileItem.size = sizeText;
                fileItem.message = '';
                me.updateAlgoResult(fileItem.hashList);
            }
            fileItem.costTime = '| 耗时 ' + ((new Date().getTime() - me.timeStart) / 1000).toFixed(2) + ' s';
        };

        reader.onerror = function () {
            fileItem.message = '文件读取出错';
            freeReader(reader);
        };

        function readNext() {
            readEnd = Math.min(readStart + chunkSize, fileSize);
            chunk = file.slice ? file.slice(readStart, readEnd) : file.webkitSlice(readStart, readEnd);

            if (reader) {
                reader.readAsArrayBuffer(chunk);
            }
        }

        setTimeout(readNext, 0);
    }

    FileHashCalc.prototype.chunkSize = 2048000; // 2MB;

    FileHashCalc.prototype.initAlgoList = function (hashList) {
        var ret = [];
        hashList.forEach(function (hash) {
            var name = hash.name, algo;
            if (algoSet.hasOwnProperty(name)) {
                algo = algoSet[name];
                if (CryptoJS.algo[algo.name]) {
                    ret.push({instance: CryptoJS.algo[algo.name].create(algo.param), name: name});
                }
            }
        });
        return ret;
    };

    FileHashCalc.prototype.updateAlgoList = function (data) {
        var wordArray = arrayBufferToWordArray(data);
        this.algoList.forEach(function (algo) {
            algo.instance.update(wordArray);
        });
    };

    FileHashCalc.prototype.updateAlgoResult = function (hashList) {
        this.algoList.forEach(function (algo) {
            hashList.forEach(function (hash) {
                if (hash.name == algo.name) {
                    hash.value = algo.instance.finalize().toString();
                }
            })
        });
    };

    function arrayBufferToWordArray(arrayBuffer) {
        var bytesLeft = arrayBuffer.byteLength % 4;
        var fullWords = Math.floor(arrayBuffer.byteLength / 4);

        var i;
        var cp = [];
        var pad = 0;
        var u8 = new Uint8Array(arrayBuffer);
        var u32 = new Uint32Array(arrayBuffer, 0, fullWords);

        for (i = 0; i < fullWords; ++i) {
            cp.push(swapEndian32(u32[i]));
        }

        if (bytesLeft) {
            for (i = bytesLeft; i > 0; --i) {
                pad = pad << 8;
                pad += u8[u8.byteLength - i];
            }

            for (i = 0; i < 4 - bytesLeft; ++i) {
                pad = pad << 8;
            }

            cp.push(pad);
        }

        return CryptoJS.lib.WordArray.create(cp, arrayBuffer.byteLength);
    }

    function freeReader(reader) {
        if (reader) {
            reader.onload = null;
            reader.onerror = null;
            reader = null;
        }
    }

    function getSize(byte) {
        if (byte > 1048576) {
            return (byte / 1048576).toFixed(3);
        }
        if (byte > 1024) {
            return (byte / 1024).toFixed(3);
        }
        return byte;
    }

    function getSizeText(byte) {
        if (byte > 1048576) {
            return (byte / 1048576).toFixed(3) + ' MB';
        }
        if (byte > 1024) {
            return (byte / 1024).toFixed(3) + ' KB';
        }
        return byte + ' B';
    }

    function swapEndian32(val) {
        return (((val & 0xFF) << 24)
            | ((val & 0xFF00) << 8)
            | ((val >> 8) & 0xFF00)
            | ((val >> 24) & 0xFF)) >>> 0;

    }
};