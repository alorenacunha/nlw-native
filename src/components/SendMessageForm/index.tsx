import React, { useState } from "react";
import { Alert, Keyboard, TextInput, View } from "react-native";
import { COLORS } from "../../theme";
import { Button } from "../Button";
import { api } from "../services/api";
import { styles } from "./styles";

export function SendMessageForm() {
  const [message, setMessage] = useState<string>("");
  const [sendingMessage, setSendingMessage] = useState(false);

  async function handleMessageSubmit() {
    console.log(message);
    const messageFormatted = message.trim();

    if (messageFormatted.length > 0) {
      setSendingMessage(true);

      await api.post("/messages", { message: messageFormatted });
      setMessage("");
      Keyboard.dismiss();
      setSendingMessage(false);
      Alert.alert("Mensagem enviada com sucesso!");
    } else {
      Alert.alert("Escreva a mensagem para enviar");
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        keyboardAppearance="dark"
        placeholder="Qual sua expectativa para o evento?"
        placeholderTextColor={COLORS.GRAY_PRIMARY}
        multiline
        maxLength={140}
        onChangeText={setMessage}
        value={message}
        editable={!sendingMessage}
      />
      <Button title="ENVIAR MENSAGEM" color={COLORS.WHITE} backgroundColor={COLORS.PINK} isLoading={sendingMessage} onPress={handleMessageSubmit} />
    </View>
  );
}
