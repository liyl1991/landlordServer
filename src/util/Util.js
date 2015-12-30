var util = {
    /**
     * 卡牌排序
     * @method cardSort
     * @param  {Object} a [description]
     * @param  {Object} b [description]
     * @return 1 : a < b ,-1 a : > b   [description]
     */
    cardSort: function (a, b){
        var va = parseInt(a.val);
        var vb = parseInt(b.val);
        if(va === vb){
            return a.type > b.type ? 1 : -1;
        } else if(va > vb){
            return -1;
        } else {
            return 1;
        }
    }
};
//玩家状态
util.PLAYER_STATUS_NORMAL = 1;
util.PLAYER_STATUS_LEAVE = 2;
util.PLAYER_STATUS_OFFLINE = 3;
//桌位状态
util.DESK_STATUS_READY = 1;
util.DESK_STATUS_ROB = 2;
util.DESK_STATUS_PLAY = 3;
module.exports = util;
