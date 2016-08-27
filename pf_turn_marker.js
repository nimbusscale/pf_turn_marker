// Github:   https://github.com/shdwjk/Roll20API/blob/master/TurnMarker1/TurnMarker1.js
// By:       Joe Keegan (a.k.a HumanNumber1)
/*  ############################################################### */
/*  PFTurnMarker */
/*  ############################################################### */

var PFTurnMarker = PFTurnMarker || (function(){
    "use strict";

    var version = '0.1',
        lastUpdate = '2016/08/26',
        schemaVersion = 0.9,
        active = false,
        threadSync = 1;


return {

    CheckInstall: function() {
        log('-=> PFTurnMarker v'+version+' <=-  ['+lastUpdate+']');

        if( ! state.hasOwnProperty('PFTurnMarker') || state.PFTurnMarker.schemaVersion !== schemaVersion)
        {
            /* Default Settings stored in the state. */
            state.PFTurnMarker = {
                version: schemaVersion,
                announceRounds: true,
                announceTurnChange: true,
                autoskipHidden: true,
                tokenName: 'Round',
                tokenURL: 'https://s3.amazonaws.com/files.d20.io/images/22283933/PPg5uMyMiqmtEz6M-HakjQ/thumb.png?1472003413',
                scale: 1.0
                };
            };
        if(Campaign().get('turnorder') ==='')
        {
            Campaign().set('turnorder','[]');
        }
    },

    GetMarker: function(){
        var marker = findObjs({
            imgsrc: state.PFTurnMarker.tokenURL,
            pageid: Campaign().get("playerpageid")
        })[0];

        if (marker === undefined) {
            marker = createObj('graphic', {
                name: state.PFTurnMarker.tokenName+' 1',
                pageid: Campaign().get("playerpageid"),
                layer: 'gmlayer',
                imgsrc: state.PFTurnMarker.tokenURL,
                left: 0,
                top: 0,
                height: 70,
                width: 70,
                bar2_value: 1,
                showplayers_name: true,
                showplayers_aura1: true,
                showplayers_aura2: true
            });
        }
        if(!TurnOrder.HasTurn(marker.id))
        {
            TurnOrder.AddTurn({
                id: marker.id,
                pr: -1,
                custom: "",
                pageid: marker.get('pageid')
            });
        }
        return marker;
    },

    Step: function( sync ){
        if (sync !== PFTurnMarker.threadSync)
        {
            return;
        }
        var marker=PFTurnMarker.GetMarker();
        if(PFTurnMarker.active === true)
        {
            setTimeout(_.bind(PFTurnMarker.Step,this,sync), 100);
        }
    },

    Reset: function() {
        PFTurnMarker.active=false;
        PFTurnMarker.threadSync++;

        var marker = PFTurnMarker.GetMarker();

        marker.set({
            layer: "gmlayer",
            aura1_radius: '',
            aura2_radius: '',
            left: 35,
            top: 35,
            height: 70,
            width: 70,
            rotation: 0,
            bar1_value: 0
        });
    },

    Start: function() {
        var marker = PFTurnMarker.GetMarker();

        PFTurnMarker.active=true;
        PFTurnMarker.Step(PFTurnMarker.threadSync);
        PFTurnMarker.TurnOrderChange(true);
    },

    HandleInput: function(tokens,who){
        switch (tokens[0])
        {
            case 'reset':
                var marker = PFTurnMarker.GetMarker();
                marker.set({
                    name: state.PFTurnMarker.tokenName+' 1',
                    bar2_value: 1
                });
                sendChat('','/w gm <b>Round</b> count is reset to <b>0</b>.');
                break;

            case 'toggle-announce':
                state.PFTurnMarker.announceRounds=!state.PFTurnMarker.announceRounds;
                sendChat('','/w gm <b>Announce Rounds</b> is now <b>'+(state.PFTurnMarker.announceRounds ? 'ON':'OFF' )+'</b>.');
                break;

            case 'toggle-announce-turn':
                state.PFTurnMarker.announceTurnChange=!state.PFTurnMarker.announceTurnChange;
                sendChat('','/w gm <b>Announce Turn Changes</b> is now <b>'+(state.PFTurnMarker.announceTurnChange ? 'ON':'OFF' )+'</b>.');
                break;

            case 'toggle-skip-hidden':
                state.PFTurnMarker.autoskipHidden=!state.PFTurnMarker.autoskipHidden;
                sendChat('','/w gm <b>Auto-skip Hidden</b> is now <b>'+(state.PFTurnMarker.autoskipHidden ? 'ON':'OFF' )+'</b>.');
                break;

            case 'help':
            default:
                PFTurnMarker.Help(who);
                break;

        }
    },

    Help: function(){
        var marker = PFTurnMarker.GetMarker();
        var rounds =parseInt(marker.get('bar2_value'),10);
        sendChat('',
            '/w gm '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
        +'PFTurnMarker v'+version
    +'</div>'
    +'<b>Commands</b>'
    +'<div style="padding-left:10px;"><b><span style="font-family: serif;">!tm</span></b>'
        +'<div style="padding-left: 10px;padding-right:20px">'
            +'The following arguments may be supplied in order to change the configuration.  All changes are persisted between script restarts.'
            +'<ul>'
                    +'<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;"><span style="color: blue; font-weight:bold; padding: 0px 4px;">'+rounds+'</span></div>'
                +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">reset</span></b> -- Sets the round counter back to 1.</li> '
                    +'<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.PFTurnMarker.announceRounds ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'
                +'<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-announce</span></b> -- When on, each round will be announced to chat.</li>'
                    +'<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.PFTurnMarker.announceTurnChange ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'
                +'<li style="border-bottom: 1px solid #ccc;"><b><span style="font-family: serif;">toggle-announce-player</span></b> -- When on, the player(s) controlling the current turn are included in the turn announcement.</li> '
                    +'<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.PFTurnMarker.autoskipHidden ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'
            +'</ul>'
        +'</div>'
    +'</div>'
    +'<div style="padding-left:10px;"><b><span style="font-family: serif;">!eot</span></b>'
        +'<div style="padding-left: 10px;padding-right:20px;">'
            +'Players may execute this command to advance the initiative to the next turn.  This only succeeds if the current token is one that the caller controls or if it is executed by a GM.'
        +'</div>'
    +'</div>'
+'</div>'
            );
    },

    CheckForTokenMove: function(obj){
        if(PFTurnMarker.active)
        {
            var turnOrder = TurnOrder.Get();
            var current = _.first(turnOrder);
            if( obj && current && current.id === obj.id)
            {
               PFTurnMarker.threadSync++;

                var marker = PFTurnMarker.GetMarker();
                marker.set({
                    "top": obj.get("top"),
                    "left": obj.get("left")
                });

               setTimeout(_.bind(PFTurnMarker.Step,this,PFTurnMarker.threadSync), 300);
            }
        }
    },

    RequestTurnAdvancement: function(playerid){
        if(PFTurnMarker.active)
        {
            var turnOrder = TurnOrder.Get(),
                current = getObj('graphic',_.first(turnOrder).id),
                character = getObj('character',(current && current.get('represents')));
            if(playerIsGM(playerid)
                || ( current &&
                       ( _.contains(current.get('controlledby').split(','),playerid)
                       || _.contains(current.get('controlledby').split(','),'all') )
                    )
                || ( character &&
                       ( _.contains(character.get('controlledby').split(','),playerid)
                       || _.contains(character.get('controlledby').split(','),'all') )
                    )
                )
            {
                TurnOrder.Next();
                PFTurnMarker.TurnOrderChange(true);
            }
        }
    },

    _AnnounceRound: function(round){
        if(state.PFTurnMarker.announceRounds)
        {
            sendChat(
                '',
                "/direct "
                +"<div style='"
                    +'background-color: #000000;'
                    +'border: 3px solid #808080;'
                    +'font-size: 20px;'
                    +'text-align:center;'
                    +'vertical-align: top;'
                    +'color: white;'
                    +'font-weight:bold;'
                    +'padding: 5px 5px;'
                +"'>"
                    +"Round "+ round
                +"</div>"
            );
        }
    },

    HandleTurnOrderChange: function() {
        var marker = PFTurnMarker.GetMarker(),
            turnorder = Campaign().get('turnorder'),
			markerTurn;

		turnorder = ('' === turnorder) ? [] : JSON.parse(turnorder);
		markerTurn = _.filter(turnorder, function(i){
			return marker.id === i.id;
		})[0];

		if(markerTurn.pr !== -1){
			markerTurn.pr = -1;
			turnorder =_.union([markerTurn], _.reject(turnorder, function(i){
				return marker.id === i.id;
			}));
			Campaign().set('turnorder',JSON.stringify(turnorder));
		}
        _.defer(_.bind(PFTurnMarker.DispatchInitiativePage,PFTurnMarker));
    },

    _HandleMarkerTurn: function(){
        var marker = PFTurnMarker.GetMarker();
        var turnOrder = TurnOrder.Get();


        if(turnOrder[0].id === marker.id)
        {
            var round=parseInt(marker.get('bar2_value'))+1;
            marker.set({
                name: state.PFTurnMarker.tokenName+' '+round,
                bar2_value: round
            });
            PFTurnMarker._AnnounceRound(round);
            TurnOrder.Next();
        }
    },

    _HandleAnnounceTurnChange: function(){

        if(state.PFTurnMarker.announceTurnChange )
        {
            var marker = PFTurnMarker.GetMarker();
            var turnOrder = TurnOrder.Get();
            var currentToken = getObj("graphic", turnOrder[0].id);
            if('gmlayer' === currentToken.get('layer'))
            {
                return;
            }


            var cImage=currentToken.get('imgsrc');
            var cRatio=currentToken.get('width')/currentToken.get('height');
            var CharID=currentToken.get('represents');

            if(currentToken && currentToken.get('showplayers_name'))
            {
                var Name=currentToken.get('name');
            } else {
                var Name='NPC';
            }

            var cNameString='<span style=\''
                +'font-size: 115%;'
                +'font-weight:bold;'
                +`text-decoration: underline;`
                +'\'>'
                +'<a href="https://journal.roll20.net/character/'
                +CharID
                +'">'
                +Name
                +'</a>'
                +'</span>';

            if (CharID) {
                var Char= getObj("character", CharID);
                if (Char.get('controlledby')) {
                    Type='player'
                } else {
                    var Type='npc';
                }
            } else {
                var Type='npc';
            };

            var tokenSize=70;
            if (Type==='player') {
                var bg_color = '#efe'
            } else {
                var bg_color = '#eef'
            }
            sendChat(
                '',
                "/direct "
                +"<div style='border: 3px solid #808080; background-color: "+bg_color+"; padding: 1px 1px;'>"
                    +'<div style="text-align: left; margin: 5px 5px; position: relative; vertical-align: text-top;">'
                        +"<img src='"+cImage+"' style='float:right; width:"+Math.round(tokenSize*cRatio)+"px; height:"+tokenSize+"px; padding: 0px 2px;' />"
                        +cNameString
                        +'<div style="clear:both;"></div>'
                    +'</div>'
                +"</div>"
            );
        }
    },

    TurnOrderChange: function(FirstTurnChanged){
        var marker = PFTurnMarker.GetMarker();

        if(Campaign().get('initiativepage') === false)
        {
            return;
        }

        var turnOrder = TurnOrder.Get();

        if (!turnOrder.length) {
            return;
        }

        var current = _.first(turnOrder);

        if (current.id === "-1") {
            return;
        }

        PFTurnMarker._HandleMarkerTurn();

        if(state.PFTurnMarker.autoskipHidden)
        {
            TurnOrder.NextVisible();
            PFTurnMarker._HandleMarkerTurn();
        }

        turnOrder=TurnOrder.Get();

        if(turnOrder[0].id === marker.id)
        {
            return;
        }

        current = _.first(TurnOrder.Get());

        var currentToken = getObj("graphic", turnOrder[0].id);
        if(undefined !== currentToken)
        {

            if(FirstTurnChanged)
            {
                PFTurnMarker._HandleAnnounceTurnChange();
            }

            var size = Math.max(currentToken.get("height"),currentToken.get("width")) * state.PFTurnMarker.scale;

            if (marker.get("layer") === "gmlayer" && currentToken.get("layer") !== "gmlayer") {
                marker.set({
                    "top": currentToken.get("top"),
                    "left": currentToken.get("left"),
                    "height": size,
                    "width": size
                });
                setTimeout(function() {
                    marker.set({
                        "layer": currentToken.get("layer")
                    });
                }, 500);
            } else {
                marker.set({
                    "layer": currentToken.get("layer"),
                    "top": currentToken.get("top"),
                    "left": currentToken.get("left"),
                    "height": size,
                    "width": size
                });
            }
            toFront(currentToken);
        }
    },

    DispatchInitiativePage: function(){
        if(Campaign().get('initiativepage') === false)
        {
            this.Reset();
        }
        else
        {
            this.Start();
        }
    },

    RegisterEventHandlers: function(){
        on("change:campaign:initiativepage", function(obj, prev) {
            PFTurnMarker.DispatchInitiativePage();
        });

        on("change:campaign:turnorder", function(obj, prev) {
            var prevOrder=JSON.parse(prev.turnorder);
            var objOrder=JSON.parse(obj.get('turnorder'));

            if( undefined !==prevOrder
             && undefined !==objOrder
               && _.isArray(prevOrder)
               && _.isArray(objOrder)
               && 0 !== prevOrder.length
               && 0 !== objOrder.length
             && objOrder[0].id !== prevOrder[0].id
              )
            {
                PFTurnMarker.TurnOrderChange(true);
            }
        });

        on("change:graphic", function(obj,prev) {
            PFTurnMarker.CheckForTokenMove(obj);
        });

        on("chat:message", function (msg) {
            /* Exit if not an api command */
            if (msg.type !== "api") {
                return;
            }

            /* clean up message bits. */
            msg.who = msg.who.replace(" (GM)", "");
            msg.content = msg.content.replace("(GM) ", "");

            // get minimal player name (hopefully unique!)
            var who=getObj('player',msg.playerid).get('_displayname').split(' ')[0];

            var tokenized = msg.content.split(" ");
            var command = tokenized[0];

            switch(command)
            {
                case "!tm":
                case "!PFTurnMarker":
                    {

                        PFTurnMarker.HandleInput(_.rest(tokenized),who);
                    }
                    break;

                case "!eot":
                    {
                        PFTurnMarker.RequestTurnAdvancement(msg.playerid);
                    }
                    break;
            }
        });

        if('undefined' !== typeof GroupInitiative && GroupInitiative.ObserveTurnOrderChange){
            GroupInitiative.ObserveTurnOrderChange(PFTurnMarker.HandleTurnOrderChange);
        }
    }

};
}());






on("ready",function(){
    'use strict';

	PFTurnMarker.CheckInstall();
	PFTurnMarker.RegisterEventHandlers();
	PFTurnMarker.DispatchInitiativePage();
});

var TurnOrder = TurnOrder || {
    Get: function(){
        var to=Campaign().get("turnorder");
        to=(''===to ? '[]' : to);
        return JSON.parse(to);
    },
    Set: function(turnOrder){
        Campaign().set({turnorder: JSON.stringify(turnOrder)});
    },
    Next: function(){
        this.Set(TurnOrder.Get().rotate(1));
        if("undefined" !== typeof Mark && _.has(Mark,'Reset') && _.isFunction(Mark.Reset)) {
            Mark.Reset();
        }
    },
    NextVisible: function(){
        var turns=this.Get();
        var context={skip: 0};
        var found=_.find(turns,function(element){
            var token=getObj("graphic", element.id);
            if(
                (undefined !== token)
                && (token.get('layer')!=='gmlayer')
            )
            {
                return true;
            }
            else
            {
                this.skip++;
            }
        },context);
        if(undefined !== found && context.skip>0)
        {
            this.Set(turns.rotate(context.skip));
        }
    },
    HasTurn: function(id){
     return (_.filter(this.Get(),function(turn){
            return id === turn.id;
        }).length !== 0);
    },
    AddTurn: function(entry){
        var turnorder = this.Get();
        turnorder.push(entry);
        this.Set(turnorder);
    }
}

Object.defineProperty(Array.prototype, 'rotate', {
    enumerable: false,
    writable: true
});

Array.prototype.rotate = (function() {
    var unshift = Array.prototype.unshift,
        splice = Array.prototype.splice;

    return function(count) {
        var len = this.length >>> 0,
            count = count >> 0;

        unshift.apply(this, splice.call(this, count % len, len));
        return this;
    };
}());
