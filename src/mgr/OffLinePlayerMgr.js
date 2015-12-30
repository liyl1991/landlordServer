/**
 * 离线玩家管理
 * @method function
 * @return {[type]} [description]
 */
var OfflinePlayerMgr = function(){
    this.offlineList = [];
};

//添加
OfflinePlayerMgr.prototype.add = function(player){
    this.offlineList.push(player);
};

//搜索，返回数组下标，不存在返回-1
OfflinePlayerMgr.prototype._search = function(obj){
    var uid = null;
    if(typeof obj == 'string'){
        uid = obj;
    } else if(typeof obj == 'object' && obj.uid){
        uid = obj.uid;
    } else {
        return;
    }
    for (var i = 0; i < this.offlineList.length; i++) {
        if(this.offlineList[i].uid === uid){
            return i;
        }
    }
    return -1;
};

//查找
OfflinePlayerMgr.prototype.find = function(obj){
    var idx = this._search(obj);
    if(idx != -1){
        return this.offlineList[idx];
    }
    return null;
};

//删除
OfflinePlayerMgr.prototype.remove = function(obj){
    var idx = this._search(obj);
    if(idx != -1){
        this.offlineList.splice(idx, 1);
    }
};

//数量
OfflinePlayerMgr.prototype.size = function(obj){
    return this.offlineList.length;
};


module.exports = new OfflinePlayerMgr();
