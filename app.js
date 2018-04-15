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

let responseTuple;
let servo;
let moveServo;

linda.io.on('connect', () => {
    console.log('linda-connect!!!');
    let last_at = Date.now();

    ts.watch({
        where: "delta",
        type: "door",
        cmd: "test"
    }, (err, tuple) => {
        console.log("> " + JSON.stringify(tuple.data) + " (from:" + tuple.from + ")");
        responseTuple = tuple.data;
        if (err) {
            responseTuple.response = 'error';
            ts.write(responseTuple);
        } else if (!('response' in tuple.data)) {
            if(last_at + 7000 < Date.now()){
                last_at = Date.now();
                responseTuple.response = 'success_test';
                ts.write(responseTuple);
                console.log('> response=' + JSON.stringify(responseTuple));
                moveServo();
            }else{
                responseTuple.response = 'already opened';
                ts.write(responseTuple);
            }
        }
    });

});


board.on("ready", () => {
    console.log('board ok');
    servo = new five.Servo({
        pin: 'GPIO18',
        startAt: 0,
        invert: true,
        range: [0, 360],
        pwmRange: [500, 2400]
    });

    moveServo = () => {
        servo.to(270, 800);
        // ts.write(responseTuple);
        board.wait(2000, () => {
            servo.to(0, 800);
        });
    }
});
