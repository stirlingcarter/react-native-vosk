import React, { useState, useEffect } from 'react';

import { StyleSheet, View, Text, Button } from 'react-native';
import Vosk from 'react-native-vosk';

const DIALOGUE_BUFFER = 5;

export default function App() {
  const [ready1, setReady1] = useState<Boolean>(true);
  const [ready2, setReady2] = useState<Boolean>(true);

  const [result1, setResult1] = useState<Array<String> | undefined>();
  const [result2, setResult2] = useState<Array<String> | undefined>();

  const vosk1 = new Vosk();
  const vosk2 = new Vosk();


  useEffect(() => {
    vosk1
      // .loadModel('model-fr-fr')
      .loadModel1('models/en')
      .then(() => setReady1(true))
      .catch((e: any) => console.log(e));

    vosk2
    // .loadModel('model-fr-fr')
    .loadModel1('models/en')
    .then(() => setReady2(true))
    .catch((e: any) => console.log(e));

    const resultEvent1 = vosk1.onResult1((res) => {
      console.log('Vosk1: ' + res.data);
    });

    const resultEvent2 = vosk2.onResult2((res) => {
      console.log('Vosk2: ' + res.data);
    });

    return () => {
      resultEvent1.remove();
      resultEvent2.remove();
    };
  }, []);

  const grammar = ['gauche', 'droite', '[unk]'];

  const record = () => {
    console.log('Starting recognition...');

    setReady1(false);
    setReady2(false);


    vosk1
      .start(grammar)
      .then((res: any) => {
        console.log('1 is: ' + res);
        setResult1(old => old != null ? 
          (old.length > DIALOGUE_BUFFER ? 
            old.slice(1).concat([res]) : 
            old.concat([res])
            ) : 
          [res]);
          console.log("ONE")
        record();
      })
      .catch((e: any) => {
        console.log('Error: ' + e);
      })
      .finally(() => {
        setReady1(true);
      });

    vosk2
    .start(grammar)
    .then((res: any) => {
      console.log('2 is: ' + res);
      setResult2(old => old != null ? 
        (old.length > DIALOGUE_BUFFER ? 
          old.slice(1).concat([res]) : 
          old.concat([res])
          ) : 
        [res]);
        console.log("TWO")

      // record();
    })
    .catch((e: any) => {
      console.log('Error: ' + e);
    })
    .finally(() => {
      setReady2(true);
    });
  };

  return (
    <View style={styles.container}>
      <Button
        onPress={record}
        title="Record"
        disabled={!ready1 || !ready2}
        color="#841584"
      />
      <Text>Recognized word:</Text>

      <Text>
        {result1 == undefined ? "placeholder" : result1.map((result) =>
        <Text>{result == "" ? "\n" : "Stir: " +result+"\n"}</Text>
      )}
      </Text>

<Text>{result2 == undefined ? "placeholder" : result2.map((result) =>
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
