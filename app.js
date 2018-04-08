const LindaClient = require('linda').Client;
const socket = require('socket.io-client').connect('http://linda-server.herokuapp.com');
const linda = new LindaClient().connect(socket);
const ts = linda.tuplespace('masuilab');

const five = require("johnny-five");
const Raspi = require("raspi-io");
const board = new five.Board({
    io: new Raspi()
});

board.on("ready", function() {
    const servo = new five.Servo({
        pin: 'GPIO18',
        startAt: 0
    });
    linda.io.on('connect', function(){
        console.log('connect!!!');
        let last_at = Date.now();
        ts.watch({
            where: "delta",
            type: "door",
            cmd: "open"
        }, function(err, tuple){
            console.log("> " + tuple.data.message + " (from:" + tuple.from + ")");
            if(last_at + 5000 < Date.now()){
                servo.to(120,800);
                board.wait(4000,function () {
                    servo.to(0,800);
                    ts.write({
                        where: 'delta',
                        type: 'door',
                        response: 'success'
                    });
                })
            }else{
                ts.write({
                    where: 'delta',
                    type : 'door',
                    response: 'tryAgain'
                });
            }

        });

    });
});


