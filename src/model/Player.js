var util = require('../util/Util.js');
/**
 * 玩家类
 * @method Player
 * @param  {[type]} n   名称
 * @param  {[type]} sid socketid
 * @param  {[type]} uid 唯一标识
 */
var Player = function (n, sid, uid){
    this.name = n;
    this.socketId = sid;
    this.uid = uid;
    this.cardList = [];
    //是否已经准备
    this.isReady = false;
    //桌号
    this.deskNo = null;
    //座位号
    this.seatNo = null;
    //积分
    this.score = 0;
    //是否是地主
    this.isLandlord = false;
    //状态 1：正常 2：离开 3：掉线
    this.status = 1;
    //下一个玩家
    this.nextCardsCnt = 0;
    //上一个玩家
    this.preCardsCnt = 0;
    //计时器id
    this.timer = null;
};

/**
 * 除去list中存在于
 * @method function
 * @param  {[type]} list [description]
 * @return {[type]}      [description]
 */
Player.prototype.subCards = function(list){
    this.cardList.sort(util.cardSort);
    for (var i = 0; i < list.length; i++) {
        for (var j = 0; j < this.cardList.length; j++) {
            if(list[i] && this.cardList[j].val === list[i].val && this.cardList[j].type === list[i].type){
                this.cardList.splice(j, 1);
                break;
            }
        }
    }
}

/**
 * 卡牌排序
 * @method cardSort
 * @param  {Object} a [description]
 * @param  {Object} b [description]
 * @return 1 : a < b ,-1 a : > b   [description]
 */
Player.prototype.cardSort = function (a, b){
    var va = parseInt(a.val);
    var vb = parseInt(b.val);
    if(va === vb){
        return a.type > b.type ? 1 : -1;
    } else if(va > vb){
        return -1;
    } else {
        return 1;
    }
};

module.exports = Player;
