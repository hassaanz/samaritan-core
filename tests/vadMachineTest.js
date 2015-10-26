var VadMachine = require('../lib/server/vadMachine').machinima;

var machine1 = {uuid: "1"};
var machine2 = {uuid: "2"};

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

// winston.log("debug", util.inspect(vadMachine));

vadMachine.on("start-talking", function(machine) {
    winston.log("info", "Machine-" + machine.uuid + ": Started Talking");
});
vadMachine.on("stop-talking", function(machine) {
    winston.log("info", "Machine-" + machine.uuid + ": Stopped Talking");
});
vadMachine.on("really-start-talking", function(machine) {
    winston.log("info", "Machine-" + machine.uuid + ": Really Started Talking");
    setTimeout(function() {
        if (randomInt(0, 10) % 2 == 0)
            vadMachine.stopTalking(machine1);
        else
            vadMachine.stopTalking(machine2);
    }, 4000);
});
vadMachine.on("really-stop-talking", function(machine) {
    winston.log("info", "Machine-" + machine.uuid + ": Really Stopped Talking");
    setTimeout(function() {
        if(randomInt(0,10) % 2 == 0)
            vadMachine.startTalking(machine1);
        else
            vadMachine.startTalking(machine2);
    }, 6000);
});

vadMachine.startTalking(machine1);
vadMachine.startTalking(machine2);