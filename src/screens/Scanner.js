import React, { useContext } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import themeContext from '../theme/themeContex';
import style from '../theme/style';
import { useNavigation } from '@react-navigation/native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { AppBar } from '@react-native-material/core';
import { useRoute } from '@react-navigation/native';
import { scanEvent } from '../redux/features/eventSlice';
import { useDispatch } from 'react-redux';

// import { ViewPropTypes } from 'react-native-view-prop-types';
// import { LogBox } from 'react-native';
// LogBox.ignoreLogs(['ViewPropTypes will be removed']);



// Get screen dimensions
const { width, height } = Dimensions.get('window');

const Scanner = () => {

    const route = useRoute();

    const dispatch = useDispatch();
    const { event_id, gate, agenda } = route?.params;

    const theme = useContext(themeContext);
    const navigation = useNavigation();

    const onSuccess = async (e) => {

        const qrData = e.data;
        const data = {
            gate_id: gate,
            agenda_id: null,
            code: qrData
        }
        try {
            const response = await dispatch(scanEvent({ id: event_id, data }));
            if (response.payload && response.payload.success) {
                const result = response.payload.result;
                console.log('result', result.isValid);
                if (result.isValid) {
                    navigation.navigate('ValidatedTicket', { data: result });
                } else {
                    navigation.navigate('InvalidTicket', { data: result });
                }
            } else {
                alert(response.payload.message);
            }
        } catch (error) {
            alert('Something went wrong. Please try again.');
        }
    };

    return (
        <SafeAreaView style={[style.area, { backgroundColor: theme.bg }]}>
            <View style={[style.main, { backgroundColor: theme.bg, flex: 1 }]}>
                {/* Header Section */}
                <View style={styles.headerContainer}>
                    <AppBar
                        color={theme.bg}
                        elevation={0}
                        leading={
                            <TouchableOpacity onPress={() => navigation.navigate('ScanEvent')}>
                                <IonIcon name="arrow-back" color={theme.txt} size={30} />
                            </TouchableOpacity>
                        }
                    />
                    <Text style={[style.apptitle, { color: theme.txt, marginLeft: 8 }]}>Scan Ticket</Text>
                </View>

                {/* QR Code Scanner Section */}
                <View style={styles.scannerWrapper}>
                    <QRCodeScanner
                        onRead={onSuccess} // Triggered when a QR code is successfully scanned
                        flashMode={RNCamera.Constants.FlashMode.off} // Control the flash mode
                        cameraStyle={styles.cameraStyle}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        backgroundColor: 'transparent',
    },
    scannerWrapper: {
        alignItems: 'center',
        marginTop: 20,
    },
    cameraStyle: {
        width: width * 0.75,
        height: height * 0.35, // Adjusted scanner height
        borderRadius: 10,
        overflow: 'hidden',
        alignSelf: 'center',
    },
});

export default Scanner;