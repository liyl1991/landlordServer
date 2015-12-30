var util = require('../util/Util.js'),
    offline = require('../mgr/OfflinePlayerMgr.js'),
    playerScoreDao = require('../dao/PlayerScoreDao.js');

var Desk = function(no){
    //桌号
    this.deskNo = no;
    //当前叫分最高
    this.currentScore = 0;
    //倍数
    this.rate = 1;
    //当前叫分次数
    this.robRound = 0;
    //底牌
    this.hiddenCards = [];
    //当前地主座位号
    this.landlordSeatNo = null;
    // winCard 牌型信息
    this.winCard = null;
    // 本轮当前赢牌的玩家
    this.roundWinSeatNo = null;
    //当前出牌玩家座位号
    this.currentPlaySeatNo = null;
    //座位
    this.seats = {
        'p1': null,
        'p2': null,
        'p3': null
    };
    //当前状态 1： 等待准备 2：抢地主 3:出牌
    this.status = 1;
};

/**
 * 游戏结束，返回所有玩家牌，胜利者座位，地主座位
 * @method gameover
 * @param  {String}   seatNo 胜利者座位号
 */
Desk.prototype.gameover = function (seatNo, lastCards){
    var self = this;
    //计算分数
    for (var p in self.seats) {
        if(self.seats[p].status != util.PLAYER_STATUS_NORMAL){
            self.seats[p].score -= self.currentScore * self.rate * (p === self.landlordSeatNo ? 6 : 3);
            continue;
        }
        if(self.landlordSeatNo === seatNo){//地主获胜
            if (p === seatNo) {//地主获取双倍分
                self.seats[p].score += self.currentScore * self.rate * 2;
            } else {//农民扣分
                self.seats[p].score -= self.currentScore * self.rate;
            }
        } else {//地主输了
            if (p === self.landlordSeatNo) {//地主扣双倍分
                self.seats[p].score -= self.currentScore * self.rate * 2;
            } else {//农民扣分
                self.seats[p].score += self.currentScore * self.rate;
            }
        }
    }
    //所有玩家都回复未准备状态并更新数据库的积分
    for (var p in self.seats) {
        if (self.seats[p]) {
            self.seats[p].isReady = false;
        }
        playerScoreDao.updateScore(self.seats[p].uid, self.seats[p].score);
    }
    self.status = util.DESK_STATUS_READY;
    //返回数据
    var data = {
            'winnerSeatNo': seatNo,
            'landlordSeatNo': self.landlordSeatNo,
            'seats': self.seats,
            'currentScore': self.currentScore,
            'lastCards': lastCards,
            'rate': self.rate
    };
    return data;
};
//游戏结束后清除已经离开的玩家
Desk.prototype.afterGameover = function(){
    var self = this;
    for (var p in self.seats) {
        if(self.seats[p].status != util.PLAYER_STATUS_NORMAL){
            offline.remove(self.seats[p].uid);
            self.seats[p] = null;
        }
    }
};

//重置
Desk.prototype.reset = function(){
    this.currentScore = 0;
    //当前叫分次数
    this.robRound = 0;
    //当前地主座位号
    this.landlordSeatNo = null;
    // winCard 牌型信息
    this.winCard = null;
    // 本轮当前赢牌的玩家
    this.roundWinSeatNo = null;
    //倍数
    this.rate = 1;
     for (var p in this.seats) {
         if (this.seats[p]) {
            this.seats[p].isReady = false;
            this.seats[p].isLandlord = false;
        }
    }
};
/**
 * 设置本轮地主
 * @method setLandlord
 */
Desk.prototype.setLandlord = function (){
    var self = this,
        seatNo = self.landlordSeatNo;
    self.status = util.DESK_STATUS_PLAY;
    self.currentPlaySeatNo = seatNo;
    self.seats[seatNo].isLandlord = true;
    self.seats[seatNo].cardList = self.seats[seatNo].cardList.concat(self.hiddenCards);
    self.seats['p1'].cardList.sort(util.cardSort);
    self.seats['p2'].cardList.sort(util.cardSort);
    self.seats['p3'].cardList.sort(util.cardSort);
};

Desk.prototype.setCardsCnt = function(player){
    if(player.seatNo === 'p1'){
        player.preCardsCnt = this.seats.p3.cardList.length;
        player.nextCardsCnt = this.seats.p2.cardList.length;
    } else if(player.seatNo === 'p2'){
        player.preCardsCnt = this.seats.p1.cardList.length;
        player.nextCardsCnt = this.seats.p3.cardList.length;
    } else if(player.seatNo === 'p3'){
        player.preCardsCnt = this.seats.p2.cardList.length;
        player.nextCardsCnt = this.seats.p1.cardList.length;
    }
};

/**
 * 本桌是否以满员且都已准备
 * @method function
 * @return {Boolean}
 */
Desk.prototype.isAllReady = function(){
    if(this.size() === 3){
        return this.seats.p1.isReady && this.seats.p2.isReady && this.seats.p3.isReady;
    } else {
        return false;
    }
};

//返回本桌人数
Desk.prototype.size = function(){
    var total = 0;
    for (var p in this.seats) {
        if(this.seats[p]){
            total ++;
        }
    }
    return total;
};

//返回本桌在线人数
Desk.prototype.onlineSize = function(){
    var total = 0;
    for (var p in this.seats) {
        if(this.seats[p] && this.seats[p].status === util.PLAYER_STATUS_NORMAL){
            total ++;
        }
    }
    return total;
};

//在删除本桌之前执行
Desk.prototype.onDestroy = function (player){
    var self = this;
    for(var p in self.seats){
        offline.remove(self.seats[p].uid);
        if(self.seats[p].timer){
            clearTimeout(self.seats[p].timer);
        }
    }
};

/**
 * 玩家离开，如果当前桌位没有玩家，删除
 * @method playerExit
 * @param  {[type]}   player [description]
 * @return {[type]}          [description]
 */
Desk.prototype.playerExit = function (player){
    var self = this;
	if(self.deskNo === player.deskNo){
		console.log(self.deskNo, '桌', player.seatNo, self.seats[player.seatNo].name, '退出了游戏');
		if(self.status === util.DESK_STATUS_ROB){//正在进行抢地主退出，需要扣分
            //扣分
            player = self.seats[player.seatNo];
            playerScoreDao.updateScore(player.uid, player.score - 10);
            //处理
            self.reset();
            self.seats[player.seatNo] = null;
            return {
                'seats': self.copySeats(),
                'status': util.DESK_STATUS_ROB
            }
		} else if(self.status === util.DESK_STATUS_PLAY){//正在进行玩牌退出，需要扣分,当前计分的4倍
            //扣分
            // player = self.seats[player.seatNo];
            // var score = player.score - self.currentScore * self.rate * 4;
            // playerScoreDao.updateScore(player.uid, score);
            self.seats[player.seatNo].status = util.PLAYER_STATUS_OFFLINE;
            offline.add(self.seats[player.seatNo]);
            //处理
            return {
                'seats': self.copySeats(),
                'status': util.DESK_STATUS_PLAY,
                'exitSeatNo': player.seatNo
            }
		} else {
            self.seats[player.seatNo] = null;
        }
	}
	return null;
};

//复制座位信息
Desk.prototype.copySeats = function (){
    var self = this,
        dest = {};
    for(var p in self.seats){
        if(self.seats[p]){
            dest[p] = {};
            for(var pro in self.seats[p]){
                if(typeof self.seats[p][pro] === 'number' || typeof self.seats[p][pro] === 'string'){
                    dest[p][pro] = self.seats[p][pro];
                }
            }
        }
    }
    return dest;
};
module.exports = Desk;
