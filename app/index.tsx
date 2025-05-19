import BtnLoginGoogle from "@/components/BtnLoginGoogle";
import { Text, View } from "react-native";

export default function IndexScreen() {
  return (
    <View>
      <Text style={{ fontSize: 20, color: 'blue', margin: 10 }}>Tutorial Login con Google</Text>
      <BtnLoginGoogle />
    </View>
  );
}