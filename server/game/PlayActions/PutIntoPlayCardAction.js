const BaseAbility = require('../baseability');
const Costs = require('../costs');
const GameActions = require('../GameActions');
const SingleCostReducer = require('../singlecostreducer');

class PutIntoPlayCardAction extends BaseAbility {
    constructor(properties = { playType: 'ability', sourceType: 'ability', target: '' }) {
        super({
            abilitySourceType: properties.sourceType,
            cost: [
                Costs.payReduceableGRCost(properties.playType)
            ]
        });
        this.target = properties.target;
        this.playType = properties.playType;
        this.reduceAmount = properties.reduceAmount;
    }

    isAction() {
        return false;
    }

    meetsRequirements(context) {
        var { player, source } = context;

        return (
            source.getType() !== 'action' &&
            player.isCardInPlayableLocation(source, this.playType) &&
            player.canPutIntoPlay(source, this.playType)
        );
    }

    resolveCosts(context) {
        var { game, player, source } = context;
        if(this.reduceAmount) {
            this.costReducer = new SingleCostReducer(game, player, null, { card: source, amount: this.reduceAmount, playingTypes: 'any'});
            player.addCostReducer(this.costReducer);
        }
        return super.resolveCosts(context);
    }

    executeHandler(context) {
        var { game, player, source } = context;
        game.resolveGameAction(GameActions.putIntoPlay({                        
            player: player,
            card: source, 
            params: { 
                playingType: this.playType, 
                target: this.target,
                context: context }
        })).thenExecute(event => {
            if(this.costReducer) { 
                event.player.removeCostReducer(this.costReducer);     
            }
        });
    }
}

module.exports = PutIntoPlayCardAction;