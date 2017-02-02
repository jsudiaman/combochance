(function () {
    var common = {};
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = common;
        }
        exports.common = common;
    } else {
        this.common = common;
    }

    /**
     * Get sum of "Amount Required" values in the table.
     *
     * @param data Form data
     * @returns {number} The sum
     */
    common.getSumRequired = function (data) {
        return _.reduce(data.cards, function (acc, card) {
            return acc + card.numRequired;
        }, 0);
    };

    /**
     * Get sum of "Amount in Deck" values in the table.
     *
     * @param data Form data
     * @returns {number} The sum
     */
    common.getSumInDeck = function (data) {
        return _.reduce(data.cards, function (acc, card) {
            return acc + card.numInDeck;
        }, 0);
    };
}.call(this));
