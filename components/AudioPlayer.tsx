import {Audio} from "expo-av";
import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Text} from "@/components/ui/text";

export default function AudioPlayer({uri}: { uri: string }) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [playing, setPlaying] = useState(false);

    const togglePlayback = async () => {
        if (!sound) return;

        if (playing) {
            await sound.pauseAsync();
            setPlaying(false);
        } else {
            await sound.playAsync();
            setPlaying(true);
        }
    };

    useEffect(() => {
        const loadSound = async () => {
            const {sound} = await Audio.Sound.createAsync({uri});
            setSound(sound);
        };

        loadSound();

        return () => {
            sound?.unloadAsync();
        };
    }, [uri]);

    return (
        <Button onPress={togglePlayback}>
            <Text>{playing ? "Пауза" : "Прослушать"}</Text>
        </Button>
    );
}
