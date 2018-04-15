const LindaClient = require('linda').Client;
const socket = require('socket.io-client').connect('http://linda-server.herokuapp.com');
const linda = new LindaClient().connect(socket);
const ts = linda.tuplespace('masuilab');

const five = require("johnny-five");
const Raspi = require("raspi-io");
const board = new five.Board({
    io: new Raspi(),
    repl: false     //デーモン化の都合上
});


let isOn = false;
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
            responseTuple.response = 'error'
            ts.write(responseTuple);
        } else if (last_at + 5000 < Date.now()) {
            last_at = Date.now();
            responseTuple.response = 'success_test';    //最後戻す
            console.log('> response=' + JSON.stringify(responseTuple));
            isOn = true;
            moveServo();

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
        //console.log('moved');
        isOn = false;
        servo.to(270, 800);
        ts.write(responseTuple);
        board.wait(2000, () => {
            servo.to(0, 800);
        });
    }
});
