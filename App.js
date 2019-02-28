import React from 'react';
import {StyleSheet, Text, View, Image, Button, TouchableOpacity} from 'react-native';
import {Accelerometer} from 'expo';
// import * from 'react-geolocation';
import Queue from './Queue';

// import Ozone from './assets/Ozone.png';
// import ColoredBoxes from './components/ColoredBoxes';



export default class App extends React.Component {

    state = {
        accelerometerData: {},
        time: null,
        speed: 0,
        distance: 0,
        totalAcceleration: 0,
        avgAcceleration: 0,
        accelerationWOGravity: 0,
        timeNow: Date.now()
    };

    speed = 0;
    time = Date.now();
    avgAcc = 9.81;
    acc = 0;
    accWOG = 0;
    distance = 0;
    totAccWOG = 0;
    speedQueue = new Queue();

    constructor(props) {
        super(props);
        this.speed = 0;
        this.time = Date.now();
        this.avgAcc = 9.81;

        console.log("constructor, avgAcc", this.avgAcc);

    }

    componentDidMount() {
        this._toggle();
        // if (this.state.accelerometerData.x && this.state.accelerometerData.y && this.state.accelerometerData.z) {
        //     console.log("yes");
        //     let { x, y, z } = this.state.accelerometerData;
        //     this.acc = this.totalAcceleration(x, y, z);
        //     this.avgAcc = this.averageAcceleration(x, y, z);
        //     this.accWOG = this.accelerationWOGravity(x, y, z);
        //     // this.setState({averageAcceleration: this.totalAcceleration(x, y, z), time: Date.now()});
        // }
        //
    }

    componentWillUnmount() {
        this._unsubscribe();
    }

    componentWillUpdate(nextProps, nextState, nextContext) {
        // let { x, y, z } = this.state.accelerometerData;
        // this.speedFromAcceleration(x, y, z, this.speed);
        // let { x, y, z } = this.state.accelerometerData;
        //     this.acc = this.totalAcceleration(x, y, z);
        //     this.avgAcc = this.averageAcceleration(x, y, z);
        //     this.accWOG = this.accelerationWOGravity(x, y, z);
        //     console.log("tot:", this.acc, "avg: ", this.avgAcc, )
    }


    _toggle = () => {
        if (this._subscription) {
            this._unsubscribe();
        } else {
            this._subscribe();
        }
    };

    _slow = () => {
        Accelerometer.setUpdateInterval(1000);
    };

    _fast = () => {
        Accelerometer.setUpdateInterval(16);
    };

    _subscribe = () => {
        this._fast();
        this._subscription = Accelerometer.addListener(accelerometerData => {
            this.setState({accelerometerData});
            // console.log(accelerometerData);
        });
    };

    _unsubscribe = () => {
        this._subscription && this._subscription.remove();
        this._subscription = null;
    };

    getTotalAcceleration = (x, y, z) => {

        if (this.acc && this.acc !== 0) {
            return this.acc;
        } else if (this.hasAccelerometerData) {
            return this.totalAcceleration(x, y, z);
        }
        return 0;
    };

    hasAccelerometerData = () => {
        if (this.state.accelerometerData) {
            let {x, y, z} = this.state.accelerometerData;
            if ((x + y + z) > 0) {
                return true;
            }
        }
        return false;
    };

    totalAcceleration = (x, y, z) => {
        const X = x * 10;
        const Y = y * 10;
        const Z = z * 10;
        // const totalAcceleration = X*X + Y*Y + Z*Z;
        // const totalAcceleration = Math.sqrt(x * x + y * y + z * z) * 10;
        const totalAcceleration = Math.sqrt((X * X + Y * Y + Z * Z))/10;
        this.acc = totalAcceleration;
        // this.setState({totalAcceleration: totalAcceleration});
        return totalAcceleration;
    };

    getAverageAcceleration = (x, y, z) => {
        if (this.hasAccelerometerData()) {
            return this.averageAcceleration(x, y, z);
        } else {
            return 9.81;
        }
    };

    averageAcceleration = (x, y, z) => {
        const multiplierIIR = 0.03;
        const totalAcc = this.totalAcceleration(x, y, z);

        const thisAvgAcc = this.avgAcc;
        // console.log("this.avgAcc", this.avgAcc);
        const avgAcclr = this.avgAcc * (1 - multiplierIIR) + multiplierIIR * totalAcc;
        // this.setState({avgAcceleration: avgAcc});
        this.avgAcc = avgAcclr;

        // console.log("tot: ", totalAcc, "avg before: ", thisAvgAcc,  ", avg: ", avgAcclr, ", this.avgAcc: ", this.avgAcc);
        return avgAcclr;
    };

    accelerationWOGravity = (x, y, z) => {
        const accWOGravity = this.totalAcceleration(x, y, z) - this.averageAcceleration(x, y, z);
        // this.setState({accelerationWOGravity: accWOGravity});
        this.accWOG = accWOGravity;
        this.totAccWOG += accWOGravity;
        return accWOGravity;
    };

    speedFromAcceleration = (x, y, z, previousSpeed) => {
        const time1 = this.time;
        const time2 = Date.now();
        // this.setState({time: time2});
        this.time = time2;
        let s = this.speed;
        const accWOG = this.accelerationWOGravity(x, y, z);

            const timeDifferenceInSeconds = (time2 - time1) / 1000;
            s = previousSpeed + accWOG * timeDifferenceInSeconds;
            s = Math.abs(s);
            const newSpeed = {speed: s, timeStamp: time2};
            // console.log("newSpeed: ", newSpeed);
            this.speedQueue.add(newSpeed);
            // this.setState({speed: s});
            // this.setState({distance: Math.abs(this.state.speed * timeDifferenceInSeconds)});
            this.speed = s;
            if (s > 0.1) {
                const dist = this.getDistance() + s * timeDifferenceInSeconds;
                this.distance = dist;
            }

        return s;
    };

    getDistance = () => {
        return this.distance;
    };

    firstTimeRun = (x, y, z, first) => {
        if (first && x && y && z) {
            console.log("x: ", x, "y: ", y, "z: ", z);
            this.acc = this.totalAcceleration(x, y, z);
            console.log("FIRSTTIMERUN!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            this.avgAcc = 9.81;
            this.accWOG = this.accelerationWOGravity(x, y, z);
            this.speed = 0;
            this.distance = 0;
            this.totAccWOG = 0;
            this.speedQueue = new Queue();
            this.speedQueue.setMaxTime(20000);
            console.log("firstTime:", this.firstTime, ", tot: ", this.acc, "avg: ", this.avgAcc, "w/o g: ", this.accWOG);
            this.firstTime = false;
        }
        // this.firstTime = true;
    };

    getMovementType = () => {
        const avgSpeed = this.speedQueue.average();
        let movementType =  null;
        if (avgSpeed < 1) {
            movementType =  "STILL";
        } else if (avgSpeed > 1 && avgSpeed < 4) {
            movementType =  "WALKING";
        } else if (avgSpeed >= 4) {
            movementType =  "RUNNING";
        } else {
            movementType =  "COULD NOT BE DEFINED";
        }
        return movementType;
    };

    firstTime = true;

    render() {

        let {x, y, z} = this.state.accelerometerData;
        if (this.firstTime) {
            this.firstTimeRun(x, y, z, this.firstTime);
        }

        this.speed = this.speedFromAcceleration(x, y, z, this.speed);

        return (
            <View style={styles.sensor}>
                <Text>Accelerometer:</Text>
                <Text>x: {round(x)} y: {round(y)} z: {round(z)}</Text>

                <Text>TOTAL ACCELERATION</Text>
                {/*<Text>total: </Text>*/}
                <Text style={{textAlign: 'right'}}>{this.getTotalAcceleration(x, y, z).toFixed(2)}</Text>
                <View style={styles.hr}/>

                <Text>AVERAGE ACCELERATION</Text>
                <Text style={{textAlign: 'right'}}>{this.getAverageAcceleration(x, y, z).toFixed(2)}</Text>
                <View style={styles.hr}/>

                <Text>ACCELERATION WITHOUT GRAVITY</Text>
                <Text style={{textAlign: 'right'}}>{this.accWOG.toFixed(2)}</Text>
                <View style={styles.hr}/>

                {/*<Text>TOTAL ACCELERATION WITHOUT GRAVITY</Text>*/}
                {/*<Text>total acc w/o gravity: {this.totAccWOG.toPrecision(3)}</Text>*/}
                {/*<Text>TIME DIFFERENCE</Text>*/}
                {/*<Text>time: {this.time}, first time: {this.state.timeNow}</Text>*/}

                <Text>SPEED</Text>
                <Text style={{textAlign: 'right'}}>{this.speed.toFixed(2)}</Text>
                <View style={styles.hr}/>

                <Text>AVERAGE SPEED</Text>
                <Text style={{textAlign: 'right'}}>{this.speedQueue.average().toFixed(2)}</Text>
                <View style={styles.hr}/>

                <Text>DISTANCE</Text>
                <Text style={{textAlign: 'right'}}>{this.distance.toFixed(2)}</Text>
                <View style={styles.hr}/>

                {/*<Text>STILL / WALKING / RUNNING</Text>*/}
                <Text>MOVEMENT TYPE: </Text>
                <Text style={styles.movementType}>{this.getMovementType()}</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={this._toggle} style={styles.button}>
                        <Text>Toggle</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this._slow} style={[styles.button, styles.middleButton]}>
                        <Text>Slow</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this._fast} style={styles.button}>
                        <Text>Fast</Text>
                    </TouchableOpacity>
                </View>

                {/*<ColoredBoxes/>*/}
                {/*<Text>It Works!!</Text>*/}
                {/*/!*<Image*!/*/}
                {/*/!*style={{width: 200, height: 200}}*!/*/}
                {/*/!*source={{uri: './assets/Ozone.png'}}/>*!/*/}

                {/*<Button*/}
                {/*title="It works!"*/}
                {/*onPress={this.okPress}*/}
                {/*style={{height: 300}}*/}
                {/*>*/}
                {/*It works!</Button>*/}
                {/*<TouchableOpacity*/}
                {/*onClick*/}
            </View>
        );
    }
}

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });


function round(n) {
    if (!n) {
        return 0;
    }

    return Math.floor(n * 100) / 100;
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    buttonContainer: {
        flexDirection: 'row',
        alignItems: 'stretch',
        marginTop: 20,
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#eee',
        padding: 10,
    },
    middleButton: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#ccc',
    },
    sensor: {
        marginTop: 30,
        paddingHorizontal: 10,
    },
    hr: {
        borderBottomColor: 'grey',
        borderBottomWidth: 1,
        marginBottom: 15,
    },
    movementType: {
        fontSize: 36,
        fontWeight: 'bold',
        color: 'red',

    },
});