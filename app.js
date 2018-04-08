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
    });
    const animation = new five.Animation(servo);
    animation.enqueue({
        cuePoints: [0, 0.25, 0.5, 0.75, 1.0],
        keyFrames: [{degrees: 0},{degrees: 180},{degrees: 180},{degrees:0}],
        duration: 5000
    });

    linda.io.on('connect', function(){
        console.log('connect!!!');
        let last_at = Date.now();

        ts.watch({
            where: "delta",
            name: "door",
            cmd: "open"
        }, function(err, tuple){
            console.log("> " + tuple.data.message + " (from:" + tuple.from + ")");
            if(last_at + 5000 < Date.now()){
                animation.play();
                ts.write({
                    where: 'delta',
                    name: 'light',
                    response: 'success',
                    cmd: 'on'
                });
            }else{

            }

        });

    });
});


