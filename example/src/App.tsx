import React, { useState, useEffect } from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import Vosk from 'react-native-vosk';

const DIALOGUE_BUFFER = 5;

export default function App() {
  const [ready, setReady] = useState<Boolean>(true);
  const [result, setResult] = useState<Array<String> | undefined>();

  const vosk = new Vosk();

  useEffect(() => {
    vosk
      // .loadModel('model-fr-fr')
      .loadModel('models/en')
      .then(() => setReady(true))
      .catch((e: any) => console.log(e));

    const resultEvent = vosk.onResult((res) => {
      console.log('A onResult event has been caught :o ' + res.data);
    });

    return () => {
      resultEvent.remove();
    };
  }, []);

  const grammar = ['gauche', 'droite', '[unk]'];

  const record = () => {
    console.log('Starting recognition...');

    setReady(false);

    vosk
      .start(grammar)
      .then((res: any) => {
        console.log('Result is: ' + res);
        setResult(old => old != null ? 
          (old.length > DIALOGUE_BUFFER ? 
            old.slice(1).concat([res]) : 
            old.concat([res])
            ) : 
          [res]);
          console.log("T")
        record();
      })
      .catch((e: any) => {
        console.log('Error: ' + e);
      })
      .finally(() => {
        setReady(true);
      });
  };

  return (
    <View style={styles.container}>
      <Button
        onPress={record}
        title="Record"
        disabled={!ready}
        color="#841584"
      />
      <Text>Recognized word:</Text>
      <Text>{result == undefined ? "placeholder" : result.map((result) =>
        <Text>{result == "" ? "\n" : "Stir: " +result+"\n"}</Text>
      )}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
