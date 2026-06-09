import { getDB, initDB } from "@/db/database";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { PaperProvider } from 'react-native-paper';

export default function RootLayout() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    initDB()
      .then(() => setReady(true))
      .catch((e) => {
        console.error('DB init failed', e);
        setReady(true); // still render, don't hang forever
      });
  }, []);

  if (!ready) return null;
  
  return (
    <PaperProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </PaperProvider>
  );
}
