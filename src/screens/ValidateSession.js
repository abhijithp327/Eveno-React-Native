import React, { useContext, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import themeContext from '../theme/themeContex';
import style from '../theme/style';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import IonIcon from 'react-native-vector-icons/Ionicons';
import { AppBar } from '@react-native-material/core';
import { useRoute } from '@react-navigation/native';
import { scanEvent, scanTicketDetail, scanTicketExhibitor, scanValidateSession } from '../redux/features/eventSlice';
import { useDispatch } from 'react-redux';

// import { ViewPropTypes } from 'react-native-view-prop-types';
// import { LogBox } from 'react-native';
// LogBox.ignoreLogs(['ViewPropTypes will be removed']);



// Get screen dimensions
const { width, height } = Dimensions.get('window');

const ValidateSession = () => {

    const route = useRoute();

    const dispatch = useDispatch();

    const { event_id } = route?.params;

    const theme = useContext(themeContext);
    const navigation = useNavigation();

    const [scanner, setScanner] = useState(null);

    // Reset scanner when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            if (scanner) {
                scanner.reactivate();
            }
            return () => {
                // Cleanup if needed
            };
        }, [scanner])
    );


    const onSuccess = async (e) => {

        const qrData = e.data;
    
        try {

            const response = await dispatch(scanValidateSession({ id: event_id, code: qrData }));
            console.log('response', response);
            if (response.payload && response.payload.success) {
                const result = response.payload.result;
                if (result) {
                    navigation.replace('SessionSuccess', { data: result, qrCodeData: qrData });
                }
            } else {
                navigation.replace('SessionInvalidTicket', {
                    data: response.payload,
                    code: qrData,
                    event_id: event_id
                });
            }
        } catch (error) {
            console.log('error', error);
            // alert('Something went wrong. Please try again.');
        }
    };

    return (
        <SafeAreaView style={[style.area, { backgroundColor: theme.bg }]}>
            <View style={[style.main, { backgroundColor: theme.bg, flex: 1 }]}>

                {/* Modified Header Section */}
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    // paddingHorizontal: 10,
                    marginBottom: 10
                }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('BottomNavigator')}
                        style={{ paddingRight: 8 }}
                    >
                        <IonIcon name="arrow-back" color={theme.txt} size={28} />
                    </TouchableOpacity>
                    <Text style={[style.apptitle, {
                        color: theme.txt,
                        marginLeft: 4
                    }]}>Validate Session</Text>
                </View>

                {/* QR Code Scanner Section */}
                <View style={styles.scannerWrapper}>
                    <QRCodeScanner
                        ref={(node) => setScanner(node)}
                        onRead={(e) => onSuccess(e)} // Triggered when a QR code is successfully scanned
                        flashMode={RNCamera.Constants.FlashMode.off} // Control the flash mode
                        cameraStyle={styles.cameraStyle}
                        reactivate={true}
                        reactivateTimeout={3000}
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

export default ValidateSession;
