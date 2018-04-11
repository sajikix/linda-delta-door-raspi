const LindaClient = require('linda').Client;
const socket = require('socket.io-client').connect('http://linda-server.herokuapp.com');
const linda = new LindaClient().connect(socket);
const ts = linda.tuplespace('masuilab');

const five = require("johnny-five");
const Raspi = require("raspi-io");
const board = new five.Board({
    io: new Raspi(),
    repl: false
});


board.on("ready", function () {
    const servo = new five.Servo({
        pin: 'GPIO18',
        startAt: 0,
        invert: true,
        range: [0, 360],
        pwmRange: [500, 2400]
    });
    linda.io.on('connect', function () {
        console.log('connect!!!');
        let last_at = Date.now();
        const moveServo = () => {
            servo.to(270, 800);
            board.wait(2000, function () {
                servo.to(0, 800);
            });
        }
        ts.watch({
            where: "delta",
            type: "door",
            cmd: "open"
        }, function (err, tuple) {
            console.log("> " + tuple.data.message + " (from:" + tuple.from + ")");
            if (last_at + 5000 < Date.now()) {
                last_at = Date.now();
                console.log('opned');
                ts.write({
                    type: 'door',
                    where: 'delta',
                    response: 'success'
                },()=>{
                    moveServo();
                });
            } else {
                ts.write({
                    where: 'delta',
                    type: 'door',
                    response: 'now-openning'
                });
            }

        });

    });
});

