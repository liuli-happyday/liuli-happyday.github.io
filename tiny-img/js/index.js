window.onload = function () {

    var vm = new Vue({
        el: '#app',
        data: {
            fileList: [],
            showImg: false,
            showBase64: false,
            base64: '',
            quality: 0.7
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
                    id: randomStr(),
                    originSize: file.size,
                    name: file.name,
                    size: '',
                    message: '',
                    file: file,
                    savePre: 0,
                    sizeStr: '',
                    originSizeStr: '',
                };

                vm.fileList.unshift(fileItem);

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

                fileItem.message = '加载中...';

                if (!/^0.\d$/.test(this.quality)) {
                    this.quality = 0.7
                }
                console.log(this.quality);

                lrz(file, {
                    quality: this.quality,
                }).then(function(rst) {
                    // 成功后 fileItem.file = 
                    fileItem.message = 'success';
                    fileItem.size = rst.fileLen;
                    fileItem.sizeStr = getSizeText(rst.fileLen);
                    fileItem.originSizeStr = getSizeText(fileItem.originSize);
                    fileItem.savePre = Math.round(((fileItem.originSize - fileItem.size) / fileItem.originSize) * 100) + '%';
                    fileItem.download = URL.createObjectURL(rst.file);
                    fileItem.base64 = rst.base64;
                    // console.log(rst);
                })

                // console.log(file, fileItem);

                // new FileHashCalc(file, fileItem);
            },
            // 显示base64
            showB64: function (item) {
                this.base64 = item.base64;
                this.showBase64= true;
            },
            // 预览
            handleShowImg: function (item) {
                this.base64 = item.base64;
                this.showImg= true;
            }
        },

        mounted: function () {
            this.init();
        }
    });

    // vm.init();
    
};

function randomStr(num) {
    if (!num) num = 8;
    var word = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var str = '';
    for (var i = 0; i < num; i++) {
        str += word[Math.floor(Math.random() * 36)];
    }
    return str;
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
