import React, {Component} from 'react';
import { View } from 'react-native';

class ColoredBoxes extends Component {
    render() {
        return (
            <View>
                <View style={{width: 200, height: 100, backgroundColor: 'powderblue'}} />
                <View style={{width: 200, height: 100, backgroundColor: 'skyblue'}} />
                <View style={{width: 200, height: 100, backgroundColor: 'steelblue'}} />
            </View>
        );
    }
}

export default ColoredBoxes;