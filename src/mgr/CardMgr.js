var Card = require('../model/Card.js');
/**
 * 卡牌管理器
 * @method CardMgr
 */
var CardMgr = function (){

};

/**
 * 发牌
 * @method function
 * @param {Desk} 桌位信息
 */
CardMgr.prototype.dealCards = function(desk){
    var self = this,
        total = 17;
    //创建一副牌
    var cards = (new Card()).data;
    //抽底牌
    for (var i = 0; i < 3; i++) {
        desk.hiddenCards[i] = self.getOneCard(cards);
    }
    //p1发牌
    desk.seats.p1.cardList = [];
    for (i = 0; i < total; i++) {
        desk.seats.p1.cardList[i] = self.getOneCard(cards);
    }
    //p2发牌
    desk.seats.p2.cardList = [];
    for (i = 0; i < total; i++) {
        desk.seats.p2.cardList[i] = self.getOneCard(cards);
    }
    //p3发牌
    desk.seats.p3.cardList = [];
    for (i = 0; i < total; i++) {
        desk.seats.p3.cardList[i] = self.getOneCard(cards);
    }
};

/**
 * 抽取牌组中的一张牌
 * @method getOneCard
 * @param  {arrry}   cards 要抽取的牌组
 * @return {Card}         抽取的牌
 */
CardMgr.prototype.getOneCard = function (cards){
    return cards.splice(this.random(0,cards.length - 1) ,1)[0];
};

/**
 * 获取min到max之间的随机整数，min和max值都取得到
 * @param  {number} min - 最小值
 * @param  {number} max - 最大值
 * @return {number}
 */
CardMgr.prototype.random = function(min, max) {
	min = min == null ? 0 : min;
	max = max == null ? 1 : max;
	var delta = (max - min) + 1;
	return Math.floor(Math.random() * delta + min);
};
module.exports = CardMgr;
