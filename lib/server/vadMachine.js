var machina = require('machina');

var startTalkingLag = 500;
var stopTalkingLag = 200;

var create = function() {
    var vadMachine = new machina.BehavioralFsm( {
        getUUID : function() {
            return this._uuid;
        },
        initialize: function( options ) {
            this._uuid = options.uuid;
            console.log("Machine initialized");
        },
        namespace: "vad-machine",
        initialState: "uninitialized",
        states: {
            uninitialized: {
                "*": function(client) {
                    this.deferUntilTransition(client);
                },
                "start-talking": function(client) {
                    this.transition(client, "start-talking");
                },
            },
            "start-talking": {
                _onEnter: function(client) {
                    client.timer = setTimeout( function() {
                        this.handle( client, "really-start-talking" );
                    }.bind( this ), startTalkingLag );
                    this.emit( "start-talking", client );
                },
                "really-start-talking": function(client) {
                    this.transition(client, "really-start-talking");
                },
                "stop-talking": function(client) {
                    clearTimeout(client.timer);
                    this.transition(client, "stop-talking");
                }
            },
            "stop-talking": {
                _onEnter: function(client) {
                    client.timer = setTimeout( function() {
                        this.handle( client, "really-stop-talking" );
                    }.bind( this ), stopTalkingLag );
                    this.emit( "stop-talking", client );
                },
                "really-stop-talking": function(client) {
                    this.transition(client, "really-stop-talking");
                },
                "start-talking": function(client) {
                    clearTimeout(client.timer);
                    this.transition(client, "start-talking");
                },
            },
            "really-start-talking": {
                _onEnter: function(client) {
                    this.emit( "really-start-talking", client );
                },
                "stop-talking": function(client) {
                    this.transition(client, "stop-talking")
                }
            },
            "really-stop-talking": {
                _onEnter: function(client) {
                    this.emit( "really-stop-talking", client );
                },
                "start-talking": function(client) {
                    this.transition(client, "start-talking");
                }
            },
            "processing": {
                _onEnter: function(client) {
                    this.emit("processing", client);
                },
                "*": function(client) {
                    this.deferUntilTransition(client);
                },
                "processing-done": function(client) {
                    this.transition(client, "uninitialized");
                }
            }
        },
        startTalking: function(client) {
            this.handle(client, "start-talking");
        },
        stopTalking: function(client) {
            this.handle(client, "stop-talking");
        },
        processing: function(client) {
            this.handle(client, "processing")
        },
        processingDone: function(client) {
            this.handle(client, "processing-done");
        }
    });
    return vadMachine;
}
exports.machinima = create;